import pandas as pd
import os

# Robust path for Render
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "synthetic_indian.csv")

print(f"Using DATA_PATH: {DATA_PATH}")   # This will show in Render Logs
def retrieve_context(query: str):
    """
    Retrieves relevant rows from dataset based on keywords.
    """
    if not os.path.exists(DATA_PATH):
        return "Dataset not found."

    df = pd.read_csv(DATA_PATH)

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

    return relevant.to_string(index=False)