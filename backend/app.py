import os
import re
import requests
import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.llm_cloud import generate_answer
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

DATA_PATH = r"C:\\Users\\rugma\\floatchat1\\backend\\data\\synthetic_indian.csv"

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
        query = item.query.lower()

        df = pd.read_csv(DATA_PATH)

        # 🔥 STEP 1: TRY DATASET FIRST
        dataset_answer = handle_dataset_query(query, df)

        if dataset_answer:
            return {"answer": dataset_answer}

        # 🔥 STEP 2: RAG (fallback)
        retrieved = retrieve_context(query)
        if not retrieved:
            retrieved = df.head(5).to_string()

        # 🔥 STEP 3: LLM
        final_context = f"""
        You are a marine expert assistant.

        Use the context below:
        {retrieved}
        """

        answer = generate_answer(final_context, query)

        return {"answer": answer}

    except Exception as e:
        return {"answer": f"Backend Error: {str(e)}"}


# =========================
# ✅ ANTHROPIC PROXY
# =========================
@app.post("/anthropic-proxy")
async def anthropic_proxy(request: Request):
    body = await request.json()

    headers = {
        "Content-Type": "application/json",
        "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
    }

    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        json=body,
        headers=headers
    )

    return resp.json()


# =========================
# ✅ RUN SERVER
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)