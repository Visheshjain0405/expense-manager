import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('expense_manager_token')
      if (storedToken) {
        try {
          setToken(storedToken)
          // Fetch current user details with token
          const data = await authService.getCurrentUser()
          if (data.success && data.user) {
            setUser(data.user)
            setIsAuthenticated(true)
          } else {
            // Token is invalid/expired
            handleClearAuth()
          }
        } catch (error) {
          console.error('Error during auth initialization:', error.message)
          handleClearAuth()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const handleClearAuth = () => {
    authService.logout()
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      if (data.success && data.token) {
        localStorage.setItem('expense_manager_token', data.token)
        setToken(data.token)
        setUser(data.user)
        setIsAuthenticated(true)
        return { success: true }
      }
      return { success: false, message: data.message || 'Login failed.' }
    } catch (error) {
      console.error('Login action error:', error)
      const message = error.response?.data?.message || 'Unable to connect to the server. Please try again in a moment.'
      return { success: false, message }
    }
  }

  const logout = () => {
    handleClearAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
