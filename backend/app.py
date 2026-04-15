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

DATA_PATH = r"C:\\Users\\rugma\\OneDrive\\Desktop\\FloatChart-AI\\backend\\data\\synthetic_indian.csv"

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

<<<<<<< Updated upstream
        # STEP 1: Try direct dataset handler
=======
        # ✅ STEP 1: DATASET
>>>>>>> Stashed changes
        dataset_answer = handle_dataset_query(query, df)
        if dataset_answer:
            return {"answer": dataset_answer}

<<<<<<< Updated upstream
        # STEP 2: RAG fallback
        retrieved = retrieve_context(query)
        if not retrieved or retrieved == "Dataset not found.":
            retrieved = df.head(10).to_string(index=False)

        final_context = f"""
You are an ocean data analyst AI.
The dataset contains Argo float measurements from the Indian Ocean (temperature, salinity, depth, etc.).

Context:
{retrieved}

Question: {item.query}
"""

        # STEP 3: Call LLM
        answer = generate_answer(final_context, item.query)
=======
        # ✅ STEP 2: RAG (SAFE)
        try:
            retrieved = retrieve_context(query)
        except Exception as e:
            print("RAG ERROR:", e)
            retrieved = ""

        if not retrieved:
            retrieved = "General marine knowledge about ocean and sea life."

        # ✅ STEP 3: LLM (SAFE)
        try:
            final_context = f"""
            You are a marine expert assistant.

            Context:
            {retrieved}
            """

            answer = generate_answer(final_context, query)
>>>>>>> Stashed changes

            # If LLM returns nothing
            if not answer or len(answer.strip()) == 0:
                return {
                    "answer": "Marine life includes fish, whales, dolphins, corals, plankton, and many deep-sea organisms."
                }

            return {"answer": answer}

        except Exception as e:
            print("LLM ERROR:", e)

            return {
                "answer": "Marine life includes a wide variety of organisms such as fish, corals, whales, dolphins, and microscopic plankton."
            }

    except Exception as e:
<<<<<<< Updated upstream
        print("=== CHAT ENDPOINT ERROR ===")
        print("Query:", item.query)
        print("Error:", str(e))
        import traceback
        print(traceback.format_exc())
        return {"answer": f"Error processing your request: {str(e)}"}
=======
        print("FATAL ERROR:", e)
        return {"answer": f"Backend Error: {str(e)}"}
>>>>>>> Stashed changes

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
    uvicorn.run(app, host="127.0.0.1", port=8000)