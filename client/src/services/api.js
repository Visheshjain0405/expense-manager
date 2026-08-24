import axios from 'axios'

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'
if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
  baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`
}

const API = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor to automatically attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expense_manager_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default API
