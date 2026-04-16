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

    # 🔥 Detect if it's dataset-related
    dataset_keywords = [
        "temperature", "salinity", "depth", "pressure",
        "ph", "oxygen", "nitrate", "chlorophyll",
        "profiler", "institution", "qc", "platform"
    ]

    is_dataset_query = any(word in query.lower() for word in dataset_keywords)

    # ✅ Dynamic system prompt
    if is_dataset_query:
        system_prompt = (
            "You are an ocean data analyst AI. "
            "Answer strictly using the provided dataset context. "
            "Give precise, data-based answers."
        )
    else:
        system_prompt = (
            "You are a marine expert AI. "
            "Answer using your general knowledge about oceans and marine life. "
            "Do not rely only on dataset context."
        )

    messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": f"""
Context:
{context}

Question:
{query}

Answer clearly and helpfully.
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
            return "Error generating response."

    except Exception as e:
        print("LLM Exception:", e)
        return "Error generating response."