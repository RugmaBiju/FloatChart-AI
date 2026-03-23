const API_BASE = "http://127.0.0.1:8000"

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