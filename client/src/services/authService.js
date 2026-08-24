import API from './api'

const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await API.get('/auth/me')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('expense_manager_token')
  },
}

export default authService
