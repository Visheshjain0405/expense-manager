import { verifyToken } from '../utils/jwt.js'

export const protect = async (req, res, next) => {
  let token

  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      req.userId = decoded.userId
      return next()
    } catch (error) {
      console.error(`Token verification failed: ${error.message}`)
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }
}
