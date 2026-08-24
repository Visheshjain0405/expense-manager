import express from 'express'
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
  getContributions,
  deleteContribution,
  pauseGoal,
  resumeGoal,
  reopenGoal,
  getSummary,
} from '../controllers/savingsGoalController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Secure endpoints
router.use(protect)

router.get('/summary', getSummary)
router.post('/', createGoal)
router.get('/', getGoals)
router.get('/:id', getGoalById)
router.put('/:id', updateGoal)
router.delete('/:id', deleteGoal)

router.post('/:id/contributions', addContribution)
router.get('/:id/contributions', getContributions)
router.delete('/:goalId/contributions/:contributionId', deleteContribution)

router.post('/:id/pause', pauseGoal)
router.post('/:id/resume', resumeGoal)
router.post('/:id/reopen', reopenGoal)

export default router
