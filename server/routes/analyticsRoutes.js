import express from 'express'
import {
  getOverview,
  getMonthly,
  getCategoryAnalytics,
  getAccountAnalytics,
  getDaily,
  getTopExpenses,
  getInsights,
} from '../controllers/analyticsController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Secure all endpoints using AuthMiddleware
router.use(protect)

router.get('/overview', getOverview)
router.get('/monthly', getMonthly)
router.get('/categories', getCategoryAnalytics)
router.get('/accounts', getAccountAnalytics)
router.get('/daily', getDaily)
router.get('/top-expenses', getTopExpenses)
router.get('/insights', getInsights)

export default router
