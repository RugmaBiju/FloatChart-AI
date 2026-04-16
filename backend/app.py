import os
import re
import requests
import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.llm_cloud import API_URL, HEADERS, generate_answer
from backend.rag_pipeline import retrieve_context

# =========================
# ✅ DATASET HANDLER
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
        "qc": "qc_flag",
        "quality": "qc_flag",
        "platform": "platform_number"
    }

    # 🔍 Match query → column
    for key, col in column_map.items():
        if key in query and col in df.columns:

            # 📅 DATE QUERY
            date_match = re.search(r"\d{2}[-/]\d{2}[-/]\d{4}", query)
            if date_match:
                date_str = date_match.group()

                df["date"] = pd.to_datetime(df["date"], errors="coerce")
                target_date = pd.to_datetime(date_str, format="%d-%m-%Y", errors="coerce")

                filtered = df[df["date"] == target_date]

                if not filtered.empty:
                    return f"On {date_str}, {col} was {filtered[col].iloc[0]}"
                else:
                    return f"No data available for {date_str}"

            # 🔢 NUMERIC → average
            if pd.api.types.is_numeric_dtype(df[col]):
                return f"Average {col} is {df[col].mean():.2f}"

            # 📝 CATEGORICAL → values
            values = df[col].dropna().unique()[:5]
            return f"{col} values include: {', '.join(map(str, values))}"

    return None


# =========================
# ✅ FASTAPI SETUP
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

# Robust path that works both locally and on Render
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "synthetic_indian.csv")

print(f"[DEBUG] Using DATA_PATH: {DATA_PATH}")
print(f"[DEBUG] File exists: {os.path.exists(DATA_PATH)}")

class ChatQuery(BaseModel):
    query: str


# =========================
# ✅ ROOT
# =========================
@app.get("/")
async def root():
    return {"status": "online", "message": "FloatChat Backend is running 🚀"}


# =========================
# ✅ DATA SUMMARY (optional)
# =========================
@app.get("/data-summary")
async def get_data_summary():
    try:
        df = pd.read_csv(DATA_PATH)

        return df[["depth_m", "temperature_c", "salinity_psu"]].head(100).to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}


# =========================
# ✅ MAIN CHAT ENDPOINT
# =========================
@app.post("/chat")
async def chat_endpoint(item: ChatQuery):
    try:
        print(f"[RAG] Received request: {item.query}")

        if not os.path.exists(DATA_PATH):
            return {"answer": f"Data file not found at: {DATA_PATH}"}

        df = pd.read_csv(DATA_PATH)
        print(f"[RAG] CSV loaded successfully. Shape: {df.shape}")

        query = item.query.lower()

        dataset_answer = handle_dataset_query(query, df)
        if dataset_answer:
            return {"answer": dataset_answer}

        retrieved = retrieve_context(query)
        if not retrieved or "Dataset not found" in str(retrieved):
            retrieved = df.head(15).to_string(index=False)

        final_context = f"""
You are an ocean data analyst AI.
Context:
{retrieved}

Question: {item.query}
"""

        answer = generate_answer(final_context, item.query)
        return {"answer": answer}

    except Exception as e:
        print("=== RAG ERROR ===")
        print("Query:", item.query)
        print("Error:", str(e))
        import traceback
        print(traceback.format_exc())
        return {"answer": f"Backend Error: {str(e)}"}
    
# =========================
# ✅ MARINE PROXY
# =========================
@app.post("/marine-proxy")
async def marine_proxy(request: Request):
    try:
        body = await request.json()
        
        # Updated model (llama-3.1-70b-versatile is deprecated)
        payload = {
            "model": "llama-3.3-70b-versatile",     # ← This is the current good model
            "messages": body.get("messages"),
            "temperature": body.get("temperature", 0.75),
            "max_tokens": body.get("max_tokens", 1000),
        }

        response = requests.post(API_URL, headers=HEADERS, json=payload)

        if response.status_code == 200:
            result = response.json()
            return {"content": result["choices"][0]["message"]["content"]}   # Return in simple format

        else:
            print("Groq Marine Error:", response.status_code, response.text)
            return {"error": f"Groq API error: {response.status_code} - {response.text}"}

    except Exception as e:
        print("Marine Proxy Error:", str(e))
        return {"error": f"Internal server error: {str(e)}"}


# =========================
# ✅ RUN SERVER
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))