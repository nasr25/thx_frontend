import api from './api'

export const appreciationService = {
  async send(payload) {
    const { data } = await api.post('/appreciations', payload)
    return data
  },

  async getReasons() {
    const { data } = await api.get('/appreciations/reasons')
    return data
  },

  async getReceived(params = {}) {
    const { data } = await api.get('/appreciations/received', { params })
    return data
  },

  async getSent(params = {}) {
    const { data } = await api.get('/appreciations/sent', { params })
    return data
  },

  async getFeed(params = {}) {
    const { data } = await api.get('/appreciations/feed', { params })
    return data
  },

  async getDashboard() {
    const { data } = await api.get('/dashboard')
    return data
  },
}
