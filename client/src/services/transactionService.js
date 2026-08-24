import API from './api'

const transactionService = {
  createTransaction: async (data) => {
    const response = await API.post('/transactions', data)
    return response.data
  },

  getTransactions: async (params = {}) => {
    const response = await API.get('/transactions', { params })
    return response.data
  },

  getTransactionById: async (id) => {
    const response = await API.get(`/transactions/${id}`)
    return response.data
  },

  updateTransaction: async (id, data) => {
    const response = await API.put(`/transactions/${id}`, data)
    return response.data
  },

  deleteTransaction: async (id) => {
    const response = await API.delete(`/transactions/${id}`)
    return response.data
  },
}

export default transactionService
