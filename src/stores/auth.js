import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user       = ref(JSON.parse(sessionStorage.getItem('auth_user') || 'null'))
  const token      = ref(sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || null)
  const expiresAt  = ref(sessionStorage.getItem('auth_expires') || null)
  const loading    = ref(false)
  const error      = ref(null)
  const authMethod = ref(sessionStorage.getItem('auth_method') || null) // 'windows' | 'admin_form'

  const isAuthenticated   = computed(() => !!token.value && !!user.value)
  const isAdmin           = computed(() => user.value?.roles?.includes('admin') || user.value?.roles?.includes('super-admin'))
  const isWindowsAuth     = computed(() => authMethod.value === 'windows')
  const preferredLanguage = computed(() => user.value?.preferred_language || 'en')

  // ─── Windows Auto-Login ────────────────────────────────────────────────────

  async function windowsLogin() {
    loading.value = true
    error.value   = null
    try {
      const res = await authService.windowsLogin()
      if (res.success) {
        storeSession(res.data, 'windows', false)
        return res.data
      }
    } catch (err) {
      const code = err.response?.data?.code
      error.value = code === 'WINDOWS_AUTH_REQUIRED' ? 'windows_auth_unavailable' : (err.response?.data?.message || 'Authentication failed')
      throw err
    } finally {
      loading.value = false
    }
  }

  // ─── Admin Form Login ──────────────────────────────────────────────────────

  async function adminLogin(credentials) {
    loading.value = true
    error.value   = null
    try {
      const res = await authService.adminLogin(credentials)
      if (res.success) {
        storeSession(res.data, 'admin_form', true)
        return res.data
      }
    } catch (err) {
      if (err.response) {
        // Server responded — show its message (e.g. invalid credentials)
        error.value = err.response.data?.message || 'Login failed'
      } else {
        // No response = network/CORS error = backend unreachable
        error.value = 'Cannot reach the server. Make sure the backend is running (php artisan serve).'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  // ─── Shared ────────────────────────────────────────────────────────────────

  async function logout() {
    try {
      if (token.value) await authService.logout()
    } finally {
      clearSession()
    }
  }

  async function fetchMe() {
    try {
      const res = await authService.me()
      user.value = res.data
      saveUser(res.data)
      return res.data
    } catch {
      clearSession()
    }
  }

  async function updateLanguage(lang) {
    await authService.updateLanguage(lang)
    if (user.value) {
      user.value.preferred_language = lang
      saveUser(user.value)
    }
  }

  async function refreshToken() {
    try {
      const res = await authService.refresh()
      if (res.success) {
        token.value     = res.data.token
        expiresAt.value = res.data.expires_at
        sessionStorage.setItem('auth_token',   res.data.token)
        sessionStorage.setItem('auth_expires', res.data.expires_at)
        if (authMethod.value === 'admin_form') {
          localStorage.setItem('auth_token', res.data.token)
        }
      }
    } catch {
      clearSession()
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  function storeSession(data, method, persistent) {
    user.value       = data.user
    token.value      = data.token
    expiresAt.value  = data.expires_at
    authMethod.value = method

    sessionStorage.setItem('auth_token',   data.token)
    sessionStorage.setItem('auth_user',    JSON.stringify(data.user))
    sessionStorage.setItem('auth_expires', data.expires_at)
    sessionStorage.setItem('auth_method',  method)
    localStorage.setItem('preferred_language', data.user?.preferred_language || 'en')

    if (persistent) {
      localStorage.setItem('auth_token', data.token)
    }
  }

  function saveUser(userData) {
    sessionStorage.setItem('auth_user', JSON.stringify(userData))
    localStorage.setItem('preferred_language', userData?.preferred_language || 'en')
  }

  function clearSession() {
    user.value = null; token.value = null; expiresAt.value = null; authMethod.value = null
    sessionStorage.clear()
    localStorage.removeItem('auth_token')
  }

  return {
    user, token, expiresAt, loading, error, authMethod,
    isAuthenticated, isAdmin, isWindowsAuth, preferredLanguage,
    windowsLogin, adminLogin, logout, fetchMe, updateLanguage, refreshToken,
  }
})
