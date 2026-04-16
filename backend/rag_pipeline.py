import pandas as pd
import os

# Robust path for Render
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "synthetic_indian.csv")

print(f"[RAG_PIPELINE] Using DATA_PATH: {DATA_PATH}")
print(f"[RAG_PIPELINE] File exists: {os.path.exists(DATA_PATH)}")

def retrieve_context(query: str):
    """
    Retrieves relevant rows from dataset based on keywords.
    """
    try:
        if not os.path.exists(DATA_PATH):
            print(f"[RAG_PIPELINE] ERROR: File not found at {DATA_PATH}")
            return f"Dataset not found at path: {DATA_PATH}"

        print(f"[RAG_PIPELINE] Loading CSV... Shape will be printed after load")
        df = pd.read_csv(DATA_PATH)
        print(f"[RAG_PIPELINE] CSV loaded successfully! Shape: {df.shape}")

        # Rename for consistency
        df = df.rename(columns={
            "depth_m": "depth",
            "temperature_c": "temp",
            "salinity_psu": "salinity"
        })

        query_lower = query.lower()

        if "temperature" in query_lower:
            relevant = df[["depth", "temp"]].head(20)
        elif "salinity" in query_lower:
            relevant = df[["depth", "salinity"]].head(20)
        elif "depth" in query_lower:
            relevant = df[["depth"]].head(20)
        else:
            relevant = df.head(20)

        print(f"[RAG_PIPELINE] Retrieved {len(relevant)} rows for query: {query}")
        return relevant.to_string(index=False)

    except Exception as e:
        print(f"[RAG_PIPELINE] CRITICAL ERROR in retrieve_context: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return f"Error loading dataset: {str(e)}"