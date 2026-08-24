import express from 'express'
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Secure all endpoints using AuthMiddleware
router.use(protect)

router.route('/')
  .post(createCategory)
  .get(getCategories)

router.route('/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory)

export default router
