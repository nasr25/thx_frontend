import api from './api'

export const authService = {
  /**
   * Called on every app load.
   * The browser automatically sends Windows credentials (Kerberos/NTLM)
   * because IIS requires Windows Auth on this endpoint.
   * Returns { user, token, expires_at } on success.
   */
  async windowsLogin() {
    // Vite proxy forwards this to localhost:8000 transparently.
    // No withCredentials override needed — the api instance already handles it.
    const { data } = await api.get('/auth/windows')
    return data
  },

  /**
   * Admin-only form login (username + password stored in DB).
   */
  async adminLogin(credentials) {
    const { data } = await api.post('/auth/admin/login', credentials)
    return data
  },

  async logout() {
    const { data } = await api.post('/auth/logout')
    return data
  },

  async me() {
    const { data } = await api.get('/auth/me')
    return data
  },

  async updateLanguage(language) {
    const { data } = await api.post('/auth/language', { language })
    return data
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh')
    return data
  },
}
