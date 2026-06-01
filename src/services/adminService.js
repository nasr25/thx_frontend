import api from './api'

export const adminService = {
  // Dashboard
  async getDashboard() {
    const { data } = await api.get('/admin/dashboard')
    return data
  },

  // User management
  async getUsers(params = {}) {
    const { data } = await api.get('/admin/users', { params })
    return data
  },

  async setUserAdmin(id, isAdmin) {
    const { data } = await api.put(`/admin/users/${id}/role`, { is_admin: isAdmin })
    return data
  },

  async setUserStatus(id, isActive) {
    const { data } = await api.put(`/admin/users/${id}/status`, { is_active: isActive })
    return data
  },

  // Settings
  async getSettings() {
    const { data } = await api.get('/admin/settings')
    return data
  },

  async updateSettings(payload) {
    const { data } = await api.put('/admin/settings', payload)
    return data
  },

  // Appreciations
  async getAppreciations(params = {}) {
    const { data } = await api.get('/admin/appreciations', { params })
    return data
  },

  async deleteAppreciation(id, reason = '') {
    const { data } = await api.delete(`/admin/appreciations/${id}`, { data: { reason } })
    return data
  },

  // Appreciation reasons (super-admin only)
  async getReasons() {
    const { data } = await api.get('/admin/reasons')
    return data
  },

  async createReason(payload) {
    const { data } = await api.post('/admin/reasons', payload)
    return data
  },

  async updateReason(id, payload) {
    const { data } = await api.put(`/admin/reasons/${id}`, payload)
    return data
  },

  async deleteReason(id) {
    const { data } = await api.delete(`/admin/reasons/${id}`)
    return data
  },

  // Activity logs
  async getActivityLogs(params = {}) {
    const { data } = await api.get('/admin/activity-logs', { params })
    return data
  },

  // Reports
  async getAnalytics(params = {}) {
    const { data } = await api.get('/admin/reports/analytics', { params })
    return data
  },

  async exportCsv(period = 'month') {
    const response = await api.get('/admin/reports/export', {
      params: { period },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `appreciations_${period}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  },

  // Notifications
  async getNotifications(params = {}) {
    const { data } = await api.get('/notifications', { params })
    return data
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count')
    return data
  },

  async markAsRead(id) {
    const { data } = await api.post(`/notifications/${id}/read`)
    return data
  },

  async markAllAsRead() {
    const { data } = await api.post('/notifications/read-all')
    return data
  },
}
