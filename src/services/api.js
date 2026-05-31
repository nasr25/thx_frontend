import axios from 'axios'

// Empty VITE_API_URL → use '/api' which Vite proxies to localhost:8000.
// The browser sees one origin → no CORS at all in local dev.
// Set VITE_API_URL=https://api.domain.com/api for cross-domain production.
const BASE_URL      = import.meta.env.VITE_API_URL || '/api'
const IS_CROSS_ORIGIN = BASE_URL.startsWith('http')

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  // Only send credentials (cookies / NTLM) on true cross-origin calls.
  // When proxied through Vite (same-origin) this is not needed.
  withCredentials: IS_CROSS_ORIGIN,
})

// ── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Session token (Windows auth) takes priority over persistent admin token
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const lang = localStorage.getItem('preferred_language') || 'en'
  config.headers['Accept-Language'] = lang

  return config
})

// ── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const code   = error.response?.data?.code

    if (status === 401 && code !== 'WINDOWS_AUTH_REQUIRED') {
      // Token expired — clear session and re-attempt Windows auth
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')

      // For admin form sessions, redirect to admin login
      const method = sessionStorage.getItem('auth_method')
      if (method === 'admin_form') {
        window.location.href = '/admin/login'
      } else {
        // For Windows auth sessions, reload triggers IIS re-authentication
        window.location.href = '/authenticating'
      }
    }

    return Promise.reject(error)
  }
)

export default api
