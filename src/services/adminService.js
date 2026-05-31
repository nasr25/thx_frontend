import api from './api'

export const adminService = {
  // Dashboard
  async getDashboard() {
    const { data } = await api.get('/admin/dashboard')
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
