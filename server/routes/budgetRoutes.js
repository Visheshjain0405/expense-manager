import express from 'express'
import {
  createBudget,
  getBudgets,
  getBudgetById,
  getBudgetSummary,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Secure endpoints
router.use(protect)

router.get('/summary', getBudgetSummary)
router.post('/', createBudget)
router.get('/', getBudgets)
router.get('/:id', getBudgetById)
router.put('/:id', updateBudget)
router.delete('/:id', deleteBudget)

export default router
