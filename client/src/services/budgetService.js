import API from './api'

const budgetService = {
  createBudget: async (data) => {
    const response = await API.post('/budgets', data)
    return response.data
  },

  getBudgets: async () => {
    const response = await API.get('/budgets')
    return response.data
  },

  getBudgetById: async (id) => {
    const response = await API.get(`/budgets/${id}`)
    return response.data
  },

  getBudgetSummary: async () => {
    const response = await API.get('/budgets/summary')
    return response.data
  },

  updateBudget: async (id, data) => {
    const response = await API.put(`/budgets/${id}`, data)
    return response.data
  },

  deleteBudget: async (id) => {
    const response = await API.delete(`/budgets/${id}`)
    return response.data
  },
}

export default budgetService
