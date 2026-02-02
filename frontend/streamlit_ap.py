'''import streamlit as st
import requests
import pandas as pd
import matplotlib.pyplot as plt

st.title("AI-Powered Ocean Data Assistant")

query = st.text_input("Ask a question about the dataset")

if query:
    response = requests.get(
        "http://127.0.0.1:8000/query",
        params={"q": query}
    )

    data = response.json()
    st.write("Predicted Intent:", data["predicted_intent"])

    if data["predicted_intent"] == "TEMP_TREND":
        df = pd.DataFrame(data["output"])
        st.line_chart(df.set_index("date"))

    else:
        st.write(data["output"])
'''

import streamlit as st

st.set_page_config(page_title="FloatChat")

st.title("🌊 FloatChat")
st.write("Frontend is running successfully!")
print("hello")