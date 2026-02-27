import pandas as pd
import os

DATA_PATH = "C:\\Users\\Dell\\Desktop\\floatchat1\\backend\\data\\synthetic_indian.csv"

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