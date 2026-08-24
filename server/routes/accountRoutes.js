import express from 'express'
import {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from '../controllers/accountController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Secure all endpoints using AuthMiddleware
router.use(protect)

router.route('/')
  .post(createAccount)
  .get(getAccounts)

router.route('/:id')
  .get(getAccountById)
  .put(updateAccount)
  .delete(deleteAccount)

export default router
