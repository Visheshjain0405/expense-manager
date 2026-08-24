import API from './api'

const reportService = {
  getReportSummary: async (params = {}) => {
    const response = await API.get('/reports/summary', { params })
    return response.data
  },

  exportTransactions: async (params = {}) => {
    const response = await API.get('/reports/transactions', { params })
    return response.data
  },
}

export default reportService
