import os
import pandas as pd
import re
import requests
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# =========================
# CONFIGURATION
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "synthetic_indian.csv")

print(f"Dataset path: {DATA_PATH}")
print(f"Dataset exists: {os.path.exists(DATA_PATH)}")

# =========================
# FASTAPI INITIALIZATION
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# IMPORT INTERNAL MODULES
# =========================
from backend.rag_pipeline import retrieve_context
from backend.llm_cloud import API_URL, HEADERS, generate_answer


# =========================
# REQUEST MODEL
# =========================
class ChatQuery(BaseModel):
    query: str


# =========================
# DATASET QUERY HANDLER
# =========================
def handle_dataset_query(query, df):

    query = query.lower()

    column_map = {
        "temperature": "temperature_c",
        "temp": "temperature_c",
        "salinity": "salinity_psu",
        "depth": "depth_m",
        "pressure": "pressure_dbar",
        "oxygen": "oxygen_umolkg",
        "density": "potential_density_kgm3",
        "chlorophyll": "chlorophyll_mgm3",
        "ph": "ph",
        "nitrate": "nitrate_umolkg",
        "profiler": "profiler",
        "institution": "institution",
        "platform": "platform_number"
    }

    for key, column in column_map.items():

        if key in query and column in df.columns:

            # DATE QUERY
            date_match = re.search(r"\d{2}[-/]\d{2}[-/]\d{4}", query)

            if date_match:

                date_str = date_match.group()

                df["date"] = pd.to_datetime(df["date"], errors="coerce")
                target_date = pd.to_datetime(date_str, format="%d-%m-%Y", errors="coerce")

                filtered = df[df["date"] == target_date]

                if not filtered.empty:
                    return f"On {date_str}, {column} was {filtered[column].iloc[0]}"

                return f"No data available for {date_str}"

            # NUMERIC COLUMN → MEAN
            if pd.api.types.is_numeric_dtype(df[column]):
                return f"Average {column} is {df[column].mean():.2f}"

            # CATEGORICAL COLUMN → SAMPLE VALUES
            values = df[column].dropna().unique()[:5]

            return f"{column} values include: {', '.join(map(str, values))}"

    return None


# =========================
# ROOT ENDPOINT
# =========================
@app.get("/")
async def root():

    return {
        "status": "online",
        "message": "FloatChat backend running"
    }


# =========================
# DATA SUMMARY ENDPOINT
# =========================
@app.get("/data-summary")
async def data_summary():

    try:

        df = pd.read_csv(DATA_PATH)

        return df[
            ["depth_m", "temperature_c", "salinity_psu"]
        ].head(100).to_dict(orient="records")

    except Exception as e:

        return {"error": str(e)}


# =========================
# MAIN CHAT ENDPOINT
# =========================
@app.post("/chat")
async def chat_endpoint(item: ChatQuery):

    try:

        query = item.query.lower()

        if not os.path.exists(DATA_PATH):
            return {"answer": "Dataset not found"}

        df = pd.read_csv(DATA_PATH)

        # STEP 1 — Direct dataset answer
        dataset_answer = handle_dataset_query(query, df)

        if dataset_answer:
            return {"answer": dataset_answer}

        # STEP 2 — Retrieve context (RAG)
        try:
            retrieved = retrieve_context(query)
        except Exception as e:
            print("RAG error:", e)
            retrieved = ""

        if not retrieved:
            retrieved = df.head(10).to_string(index=False)

        # STEP 3 — LLM prompt
        prompt = f"""
You are an ocean data analyst AI.

Dataset context:
{retrieved}

User question:
{item.query}
"""

        answer = generate_answer(prompt, query)

        if not answer:
            return {"answer": "No response generated"}

        return {"answer": answer}

    except Exception as e:

        print("Chat endpoint error:", e)

        return {"answer": f"Backend error: {str(e)}"}


# =========================
# MARINE PROXY (LLM API)
# =========================
@app.post("/marine-proxy")
async def marine_proxy(request: Request):

    try:

        body = await request.json()

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": body.get("messages"),
            "temperature": body.get("temperature", 0.7),
            "max_tokens": body.get("max_tokens", 1000),
        }

        response = requests.post(API_URL, headers=HEADERS, json=payload)

        if response.status_code == 200:

            result = response.json()

            return {
                "content": result["choices"][0]["message"]["content"]
            }

        return {
            "error": f"Groq API error: {response.status_code}"
        }

    except Exception as e:

        return {"error": str(e)}


# =========================
# SERVER ENTRY POINT
# =========================
if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000))
    )