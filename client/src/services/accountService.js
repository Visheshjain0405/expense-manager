import API from './api'

const accountService = {
  createAccount: async (data) => {
    const response = await API.post('/accounts', data)
    return response.data
  },

  getAccounts: async () => {
    const response = await API.get('/accounts')
    return response.data
  },

  getAccountById: async (id) => {
    const response = await API.get(`/accounts/${id}`)
    return response.data
  },

  updateAccount: async (id, data) => {
    const response = await API.put(`/accounts/${id}`, data)
    return response.data
  },

  deleteAccount: async (id) => {
    const response = await API.delete(`/accounts/${id}`)
    return response.data
  },
}

export default accountService
