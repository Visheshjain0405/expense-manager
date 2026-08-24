import API from './api'

const categoryService = {
  createCategory: async (data) => {
    const response = await API.post('/categories', data)
    return response.data
  },

  getCategories: async (params = {}) => {
    const response = await API.get('/categories', { params })
    return response.data
  },

  getCategoryById: async (id) => {
    const response = await API.get(`/categories/${id}`)
    return response.data
  },

  updateCategory: async (id, data) => {
    const response = await API.put(`/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id) => {
    const response = await API.delete(`/categories/${id}`)
    return response.data
  },
}

export default categoryService
