import express from 'express'
import {
  createNetWorthItem,
  getNetWorthItems,
  getNetWorthItemById,
  updateNetWorthItem,
  deleteNetWorthItem,
  getOverview,
  getHistory,
} from '../controllers/netWorthController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Secure endpoints
router.use(protect)

router.get('/overview', getOverview)
router.get('/history', getHistory)

router.post('/items', createNetWorthItem)
router.get('/items', getNetWorthItems)
router.get('/items/:id', getNetWorthItemById)
router.put('/items/:id', updateNetWorthItem)
router.delete('/items/:id', deleteNetWorthItem)

export default router
