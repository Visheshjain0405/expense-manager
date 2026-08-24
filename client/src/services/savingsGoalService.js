import API from './api'

const savingsGoalService = {
  getGoals: async () => {
    const response = await API.get('/savings-goals')
    return response.data
  },

  getGoalById: async (id) => {
    const response = await API.get(`/savings-goals/${id}`)
    return response.data
  },

  getGoalSummary: async () => {
    const response = await API.get('/savings-goals/summary')
    return response.data
  },

  createGoal: async (data) => {
    const response = await API.post('/savings-goals', data)
    return response.data
  },

  updateGoal: async (id, data) => {
    const response = await API.put(`/savings-goals/${id}`, data)
    return response.data
  },

  deleteGoal: async (id) => {
    const response = await API.delete(`/savings-goals/${id}`)
    return response.data
  },

  addContribution: async (id, data) => {
    const response = await API.post(`/savings-goals/${id}/contributions`, data)
    return response.data
  },

  getContributions: async (id) => {
    const response = await API.get(`/savings-goals/${id}/contributions`)
    return response.data
  },

  deleteContribution: async (goalId, contributionId) => {
    const response = await API.delete(`/savings-goals/${goalId}/contributions/${contributionId}`)
    return response.data
  },

  pauseGoal: async (id) => {
    const response = await API.post(`/savings-goals/${id}/pause`)
    return response.data
  },

  resumeGoal: async (id) => {
    const response = await API.post(`/savings-goals/${id}/resume`)
    return response.data
  },

  reopenGoal: async (id) => {
    const response = await API.post(`/savings-goals/${id}/reopen`)
    return response.data
  },
}

export default savingsGoalService
