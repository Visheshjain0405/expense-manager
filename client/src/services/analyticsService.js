import API from './api'

const analyticsService = {
  getOverview: async (params = {}) => {
    const response = await API.get('/analytics/overview', { params })
    return response.data
  },

  getMonthlyAnalytics: async (params = {}) => {
    const response = await API.get('/analytics/monthly', { params })
    return response.data
  },

  getCategoryAnalytics: async (params = {}) => {
    const response = await API.get('/analytics/categories', { params })
    return response.data
  },

  getAccountAnalytics: async (params = {}) => {
    const response = await API.get('/analytics/accounts', { params })
    return response.data
  },

  getDailyAnalytics: async (params = {}) => {
    const response = await API.get('/analytics/daily', { params })
    return response.data
  },

  getTopExpenses: async (params = {}) => {
    const response = await API.get('/analytics/top-expenses', { params })
    return response.data
  },

  getInsights: async (params = {}) => {
    const response = await API.get('/analytics/insights', { params })
    return response.data
  },
}

export default analyticsService
