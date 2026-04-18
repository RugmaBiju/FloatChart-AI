const API_BASE = "https://floatchart-ai-x0mc.onrender.com/chat"

export async function fetchChatResponse(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: message })
  })

  return res.json()
}

export async function fetchOceanData() {
  const res = await fetch(`${API_BASE}/data-summary`)
  return res.json()
}