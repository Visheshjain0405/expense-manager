import API from './api'

const netWorthService = {
  getNetWorthOverview: async () => {
    const response = await API.get('/net-worth/overview')
    return response.data
  },

  getNetWorthHistory: async () => {
    const response = await API.get('/net-worth/history')
    return response.data
  },

  getNetWorthItems: async () => {
    const response = await API.get('/net-worth/items')
    return response.data
  },

  getNetWorthItemById: async (id) => {
    const response = await API.get(`/net-worth/items/${id}`)
    return response.data
  },

  createNetWorthItem: async (data) => {
    const response = await API.post('/net-worth/items', data)
    return response.data
  },

  updateNetWorthItem: async (id, data) => {
    const response = await API.put(`/net-worth/items/${id}`, data)
    return response.data
  },

  deleteNetWorthItem: async (id) => {
    const response = await API.delete(`/net-worth/items/${id}`)
    return response.data
  },
}

export default netWorthService
