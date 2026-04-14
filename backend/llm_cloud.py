from dotenv import load_dotenv
import os
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(dotenv_path=ENV_PATH)

print("Looking for .env at:", ENV_PATH)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print("Loaded Groq Key:", GROQ_API_KEY)

API_URL = "https://api.groq.com/openai/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

def generate_answer(context, query):

    messages = [
    {
        "role": "system",
        "content": (
            "You are an ocean data analyst AI. "
            "The dataset provided contains ocean water measurements from Argo floats "
            "(temperature, salinity, depth). "
            "Always use the given context to answer. "
            "Do NOT say data is missing. "
            "Give clear, confident, data-based answers."
        )
    },
    {
        "role": "user",
        "content": f"""
Context:
{context}

Question:
{query}

Answer using the data above. Be direct and specific.
"""
    }
]

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": messages,
        "temperature": 0.7
    }

    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload)

        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]

        else:
            print("Groq Error:", response.status_code, response.text)
            return f"Error: {response.status_code}"

    except Exception as e:
        return f"Internal Error: {str(e)}"