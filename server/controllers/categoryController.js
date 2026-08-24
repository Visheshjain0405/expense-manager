import mongoose from 'mongoose'
import Category from '../models/Category.js'
import Transaction from '../models/Transaction.js'

// Create custom category
export const createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      })
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense.',
      })
    }

    const cleanName = name.trim()

    // Case-insensitive duplicate category name check for the same user and type
    const categoryExists = await Category.findOne({
      userId: req.userId,
      type,
      name: { $regex: new RegExp(`^${cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
    })

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      })
    }

    const category = await Category.create({
      userId: req.userId,
      name: cleanName,
      type,
      icon: icon || 'FolderOpen',
      color: color || '#64748B',
      isDefault: false,
    })

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    })
  } catch (error) {
    console.error(`Error in createCategory: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error creating category.',
    })
  }
}

// Get user categories
export const getCategories = async (req, res) => {
  try {
    const query = { userId: new mongoose.Types.ObjectId(req.userId) }
    const { type } = req.query

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type
    }

    // Run lookup aggregation to retrieve transactionCount dynamically
    const categoriesRaw = await Category.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'transactions',
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          name: 1,
          type: 1,
          icon: 1,
          color: 1,
          isDefault: 1,
          createdAt: 1,
          updatedAt: 1,
          transactionCount: { $size: '$transactions' },
        },
      },
      { $sort: { name: 1 } },
    ])

    const categories = categoriesRaw.map((c) => {
      c.id = c._id.toString()
      delete c._id
      return c
    })

    return res.status(200).json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error(`Error in getCategories: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving categories.',
    })
  }
}

// Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category || category.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      })
    }

    return res.status(200).json({
      success: true,
      category,
    })
  } catch (error) {
    console.error(`Error in getCategoryById: ${error.message}`)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving category details.',
    })
  }
}

// Update category
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category || category.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      })
    }

    const { name, type, icon, color } = req.body

    const cleanName = name ? name.trim() : category.name
    const targetType = type || category.type

    // If type or name is changing, verify no name duplicate clashes
    if ((name && cleanName !== category.name) || (type && type !== category.type)) {
      const categoryExists = await Category.findOne({
        _id: { $ne: category._id },
        userId: req.userId,
        type: targetType,
        name: { $regex: new RegExp(`^${cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      })

      if (categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists for this type.',
        })
      }
    }

    if (name) category.name = cleanName
    if (type && ['income', 'expense'].includes(type)) category.type = type
    if (icon) category.icon = icon
    if (color) category.color = color

    await category.save()

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    })
  } catch (error) {
    console.error(`Error in updateCategory: ${error.message}`)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error updating category.',
    })
  }
}

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category || category.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      })
    }

    // A category cannot be deleted if transactions currently use it
    const transactionReferenced = await Transaction.findOne({ categoryId: category._id })
    if (transactionReferenced) {
      return res.status(400).json({
        success: false,
        message: 'This category is being used by existing transactions.',
      })
    }

    await category.deleteOne()

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error(`Error in deleteCategory: ${error.message}`)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error deleting category.',
    })
  }
}
