import express from 'express'
import {
  getReportSummary,
  exportTransactions
} from '../controllers/reportController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Secure endpoints
router.use(protect)

router.get('/summary', getReportSummary)
router.get('/transactions', exportTransactions)

export default router
