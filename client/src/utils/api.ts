const API_BASE_URL = "http://localhost:5000/api"

export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (!response.ok) throw new Error("API request failed")
    return response.json()
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("API request failed")
    return response.json()
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("API request failed")
    return response.json()
  },
}
