import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
})

// ── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // The Windows-auth endpoint must be a clean IIS request — never attach a
  // stale Bearer token; identity comes from the IIS Windows Auth handshake.
  const isWindowsAuth = (config.url || '').includes('/auth/windows')

  // Session token (Windows auth) takes priority over persistent admin token
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
  if (token && !isWindowsAuth) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const lang = localStorage.getItem('preferred_language') || 'en'
  config.headers['Accept-Language'] = lang

  return config
})

// ── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const code   = error.response?.data?.code
    const url    = error.config?.url || ''

    // Only redirect on 401 (expired/invalid token).
    // Never redirect on 4xx/5xx from auth endpoints — those are handled by the
    // calling code (windowsLogin, adminLogin) and must NOT cause a redirect loop.
    const isAuthEndpoint = url.includes('/auth/windows') || url.includes('/auth/admin/login')

    if (status === 401 && !isAuthEndpoint && code !== 'WINDOWS_AUTH_REQUIRED') {
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')

      const method = sessionStorage.getItem('auth_method')
      // Only redirect if not already on an auth page
      if (!window.location.pathname.includes('/admin/login') &&
          !window.location.pathname.includes('/authenticating')) {
        window.location.href = method === 'admin_form' ? '/admin/login' : '/authenticating'
      }
    }

    return Promise.reject(error)
  }
)

export default api
