import pandas as pd

df = pd.read_csv("data/indian_ocean_index.csv")

def handle_intent(intent):
    if intent == "AVG_TEMP":
        return float(df["sea_surface_temp"].mean())

    if intent == "MAX_SEA_LEVEL":
        row = df.loc[df["sea_level"].idxmax()]
        return row.to_dict()

    if intent == "SUMMARY":
        return df.describe().to_dict()

    if intent == "TEMP_TREND":
        return df[["date", "sea_surface_temp"]].to_dict()

    return "Intent not supported"
