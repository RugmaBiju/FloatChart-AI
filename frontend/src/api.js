const API_BASE = " https://floatchart-ai-x0mc.onrender.com"

export async function fetchChatResponse(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  })

  return res.json()
}

export async function fetchOceanData() {
  const res = await fetch(`${API_BASE}/ocean-data`)
  return res.json()
}