import API from './api'

const recurringTransactionService = {
  createRecurringTransaction: async (data) => {
    const response = await API.post('/recurring-transactions', data)
    return response.data
  },

  getRecurringTransactions: async (params = {}) => {
    const response = await API.get('/recurring-transactions', { params })
    return response.data
  },

  getRecurringTransactionById: async (id) => {
    const response = await API.get(`/recurring-transactions/${id}`)
    return response.data
  },

  updateRecurringTransaction: async (id, data) => {
    const response = await API.put(`/recurring-transactions/${id}`, data)
    return response.data
  },

  deleteRecurringTransaction: async (id) => {
    const response = await API.delete(`/recurring-transactions/${id}`)
    return response.data
  },

  pauseRecurringTransaction: async (id) => {
    const response = await API.post(`/recurring-transactions/${id}/pause`)
    return response.data
  },

  resumeRecurringTransaction: async (id) => {
    const response = await API.post(`/recurring-transactions/${id}/resume`)
    return response.data
  },

  cancelRecurringTransaction: async (id) => {
    const response = await API.post(`/recurring-transactions/${id}/cancel`)
    return response.data
  },
}

export default recurringTransactionService
