import jwt from 'jsonwebtoken'

export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing!')
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  
  return jwt.sign({ userId }, secret, { expiresIn })
}

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing!')
  }
  
  return jwt.verify(token, secret)
}
