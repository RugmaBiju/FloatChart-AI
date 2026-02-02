'''from fastapi import FastAPI
from intent_classifier import predict_intent
from data_handler import handle_intent

app = FastAPI()

@app.get("/query")
def query(q: str):
    intent = predict_intent(q)
    result = handle_intent(intent)

    return {
        "query": q,
        "predicted_intent": intent,
        "output": result
    }
'''

from fastapi import FastAPI
import pandas as pd

app = FastAPI()

# Load dataset
df = pd.read_csv("data/indian_ocean_index.csv")

@app.get("/")
def home():
    return {"status": "FloatChat backend running"}

@app.get("/data/summary")
def data_summary():
    return {
        "rows": len(df),
        "columns": list(df.columns)
    }
