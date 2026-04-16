import pandas as pd
import os

# Try multiple possible paths - this helps on Render
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
possible_paths = [
    os.path.join(BASE_DIR, "data", "synthetic_indian.csv"),           # Current
    os.path.join(BASE_DIR, "..", "data", "synthetic_indian.csv"),     # One level up
    "data/synthetic_indian.csv",                                      # Relative
    "/opt/render/project/src/backend/data/synthetic_indian.csv"       # Render absolute (fallback)
]

DATA_PATH = None
for path in possible_paths:
    if os.path.exists(path):
        DATA_PATH = path
        break

if DATA_PATH is None:
    DATA_PATH = possible_paths[0]  # fallback

print(f"[RAG] Final DATA_PATH chosen: {DATA_PATH}")
print(f"[RAG] File exists: {os.path.exists(DATA_PATH)}")

def retrieve_context(query: str):
    try:
        if not os.path.exists(DATA_PATH):
            return f"Dataset not found. Path tried: {DATA_PATH}"

        df = pd.read_csv(DATA_PATH)
        print(f"[RAG] CSV loaded successfully! Shape: {df.shape}")

        # Rename columns
        df = df.rename(columns={
            "depth_m": "depth",
            "temperature_c": "temp",
            "salinity_psu": "salinity"
        })

        query_lower = query.lower()

        if "temperature" in query_lower or "temp" in query_lower:
            relevant = df[["depth", "temp"]].head(20)
        elif "salinity" in query_lower:
            relevant = df[["depth", "salinity"]].head(20)
        elif "depth" in query_lower:
            relevant = df[["depth"]].head(20)
        else:
            relevant = df.head(20)

        return relevant.to_string(index=False)

    except Exception as e:
        print(f"[RAG] ERROR in retrieve_context: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return f"Error reading dataset: {str(e)}"