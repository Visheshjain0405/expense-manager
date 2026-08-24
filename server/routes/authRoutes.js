import express from 'express'
import { createUser, login, getMe } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/create-user', createUser)
router.post('/login', login)
router.get('/me', protect, getMe)

export default router
