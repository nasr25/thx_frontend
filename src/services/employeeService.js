import api from './api'

export const employeeService = {
  async getAll(params = {}) {
    const { data } = await api.get('/employees', { params })
    return data
  },

  async search(query, perPage = 10) {
    const { data } = await api.get('/employees/search', { params: { q: query, per_page: perPage } })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/employees/${id}`)
    return data
  },

  async getAppreciations(id, params = {}) {
    const { data } = await api.get(`/employees/${id}/appreciations`, { params })
    return data
  },
}
