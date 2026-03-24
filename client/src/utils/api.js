import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor to attach Supabase JWT to all requests
api.interceptors.request.use(async (config) => {
  // Get token from localStorage (set by AuthContext)
  const token = localStorage.getItem('gs_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage
      localStorage.removeItem('gs_access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
