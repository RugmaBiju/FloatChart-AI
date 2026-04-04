import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from backend.llm_cloud import generate_answer
from backend.rag_pipeline import retrieve_context

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = r"C:\\Users\\rugma\\floatchat1\\backend\\data\\synthetic_indian.csv"

class ChatQuery(BaseModel):
    query: str

@app.get("/")
async def root():
    return {"status": "online", "message": "FloatChat Backend is listening on /chat and /data-summary"}

@app.get("/data-summary")
async def get_data_summary():
    try:
        if not os.path.exists(DATA_PATH):
            return {"error": f"File not found at {DATA_PATH}. Check your folder structure!"}
            
        df = pd.read_csv(DATA_PATH)
        df_renamed = df.rename(columns={
            "depth_m": "depth",
            "temperature_c": "temp",
            "salinity_psu": "salinity"
        })
        
        return df_renamed[["depth", "temp", "salinity"]].head(100).to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}

@app.post("/chat")
async def chat_endpoint(item: ChatQuery):
    try:
        query = item.query.lower()
        df = pd.read_csv(DATA_PATH)
        df = df.rename(columns={"depth_m": "depth", "temperature_c": "temp", "salinity_psu": "salinity"})

        computed_info = ""
        if "average temperature" in query:
            computed_info = f"The computed average temperature is {df['temp'].mean():.2f}°C."
        elif "average salinity" in query:
            computed_info = f"The computed average salinity is {df['salinity'].mean():.2f} PSU."
        elif "average depth" in query:
            computed_info = f"The computed average depth is {df['depth'].mean():.2f} meters."

        # RAG Logic
        retrieved = retrieve_context(query)
        final_context = f"Insights: {computed_info}\n\nSample: {retrieved}"
        answer = generate_answer(final_context, query)

        return {"answer": answer}
    except Exception as e:
        return {"answer": f"Backend Error: {str(e)}"}

@app.post("/anthropic-proxy")
async def anthropic_proxy(request: Request):
    body = await request.json()
    headers = {
        "Content-Type": "application/json",
        "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
    }
    resp = requests.post("https://api.anthropic.com/v1/messages", json=body, headers=headers)
    return resp.json()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)