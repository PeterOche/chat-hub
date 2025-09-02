import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (dev) or will be httpOnly cookie in prod
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // For mutating requests, attach CSRF token from cookie
    const method = (config.method || "").toLowerCase()
    const isMutating = ["post", "patch", "put", "delete"].includes(method)

    if (isMutating && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )csrf=([^;]+)/)
      const csrfToken = match ? decodeURIComponent(match[1]) : null
      if (csrfToken) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(config.headers as any)["X-CSRF-Token"] = csrfToken
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
