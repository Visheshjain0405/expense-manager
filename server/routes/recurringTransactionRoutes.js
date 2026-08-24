import express from 'express'
import {
  createRecurringTransaction,
  getRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
  cancelRecurringTransaction,
} from '../controllers/recurringTransactionController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Secure endpoints
router.use(protect)

router.post('/', createRecurringTransaction)
router.get('/', getRecurringTransactions)
router.get('/:id', getRecurringTransactionById)
router.put('/:id', updateRecurringTransaction)
router.delete('/:id', deleteRecurringTransaction)

// Pause/Resume/Cancel triggers
router.post('/:id/pause', pauseRecurringTransaction)
router.post('/:id/resume', resumeRecurringTransaction)
router.post('/:id/cancel', cancelRecurringTransaction)

export default router
