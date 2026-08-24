import Transaction from '../models/Transaction.js'
import Category from '../models/Category.js'
import Account from '../models/Account.js'

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, date, categoryId, accountId, description, notes } = req.body

    // Simple validation checks
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense.',
      })
    }

    if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be greater than 0.',
      })
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      })
    }

    // Verify category exists and belongs to user
    const matchedCategory = await Category.findOne({ _id: categoryId, userId: req.userId })
    if (!matchedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      })
    }

    // Verify category type matches transaction type
    if (matchedCategory.type !== type) {
      return res.status(400).json({
        success: false,
        message: `Category type "${matchedCategory.type}" does not match transaction type "${type}".`,
      })
    }

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account is required.',
      })
    }

    // Verify account exists and belongs to user
    const matchedAccount = await Account.findOne({ _id: accountId, userId: req.userId, isActive: true })
    if (!matchedAccount) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.',
      })
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Description is required.',
      })
    }

    let parsedDate = Date.now()
    if (date) {
      const parsed = Date.parse(date)
      if (isNaN(parsed)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date.',
        })
      }
      parsedDate = new Date(parsed)
    }

    // Save transaction with userId extracted from protect authMiddleware
    let transaction = await Transaction.create({
      userId: req.userId,
      type,
      amount,
      date: parsedDate,
      categoryId,
      accountId,
      description: description.trim(),
      notes: notes ? notes.trim() : '',
    })

    // Populate category and account information
    transaction = await transaction.populate(['categoryId', 'accountId'])

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction,
    })
  } catch (error) {
    console.error(`Error in createTransaction: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error creating transaction.',
    })
  }
}

// Get user transactions with pagination, filtering, searching, and sorting
export const getTransactions = async (req, res) => {
  try {
    const query = { userId: req.userId }

    // 1. Filtering
    const { type, category, categoryId, accountId, startDate, endDate, search, sort, page, limit } = req.query

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type
    }

    if (categoryId) {
      query.categoryId = categoryId
    } else if (category) {
      // Find matching categories by name for the user
      const matchedCats = await Category.find({
        userId: req.userId,
        name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
      })
      const matchedCatIds = matchedCats.map((c) => c._id)
      query.categoryId = { $in: matchedCatIds }
    }

    if (accountId) {
      query.accountId = accountId
    }

    // Date Range Filtering
    if (startDate || endDate) {
      query.date = {}
      if (startDate) {
        const startParsed = Date.parse(startDate)
        if (!isNaN(startParsed)) {
          query.date.$gte = new Date(startParsed)
        }
      }
      if (endDate) {
        const endParsed = Date.parse(endDate)
        if (!isNaN(endParsed)) {
          // Set to end of day boundary
          const end = new Date(endParsed)
          end.setHours(23, 59, 59, 999)
          query.date.$lte = end
        }
      }
    }

    // 2. Search (Case-insensitive matching across description, category, and notes)
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i')
      // Find matching categories
      const matchedSearchCats = await Category.find({
        userId: req.userId,
        name: searchRegex,
      })
      const matchedSearchCatIds = matchedSearchCats.map((c) => c._id)

      // Find matching accounts
      const matchedSearchAccs = await Account.find({
        userId: req.userId,
        name: searchRegex,
      })
      const matchedSearchAccIds = matchedSearchAccs.map((a) => a._id)

      query.$or = [
        { description: searchRegex },
        { notes: searchRegex },
        { categoryId: { $in: matchedSearchCatIds } },
        { accountId: { $in: matchedSearchAccIds } },
      ]
    }

    // 3. Sorting
    let sortOption = { date: -1 } // Default newest
    if (sort) {
      switch (sort) {
        case 'oldest':
          sortOption = { date: 1 }
          break
        case 'highest':
          sortOption = { amount: -1 }
          break
        case 'lowest':
          sortOption = { amount: 1 }
          break
        case 'newest':
        default:
          sortOption = { date: -1 }
          break
      }
    }

    // 4. Pagination
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20))
    const skipNum = (pageNum - 1) * limitNum

    const total = await Transaction.countDocuments(query)
    const transactions = await Transaction.find(query)
      .populate(['categoryId', 'accountId'])
      .sort(sortOption)
      .skip(skipNum)
      .limit(limitNum)

    const totalPages = Math.ceil(total / limitNum)

    // Calculate dynamic aggregates (ignoring pagination limits but respecting all search filters)
    const summaryResult = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          totalCount: { $sum: 1 },
        },
      },
    ])

    const summary = summaryResult[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      totalCount: 0,
    }

    return res.status(200).json({
      success: true,
      transactions,
      summary: {
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        netBalance: summary.totalIncome - summary.totalExpenses,
        totalCount: summary.totalCount,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error(`Error in getTransactions: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving transactions.',
    })
  }
}

// Get single transaction details by ID
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(['categoryId', 'accountId'])

    // Verify presence and ownership (to prevent data-harvesting, return generic 404)
    if (!transaction || transaction.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }

    return res.status(200).json({
      success: true,
      transaction,
    })
  } catch (error) {
    console.error(`Error in getTransactionById: ${error.message}`)
    // Handle invalid ObjectId casts gracefully as 404
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving transaction details.',
    })
  }
}

// Update existing transaction
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction || transaction.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }

    const { type, amount, date, categoryId, accountId, description, notes } = req.body

    // Validation checks for modifications
    const cleanType = type || transaction.type
    const cleanCategoryId = categoryId || transaction.categoryId

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense.',
      })
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0.',
      })
    }

    if (type || categoryId) {
      const matchedCategory = await Category.findOne({ _id: cleanCategoryId, userId: req.userId })
      if (!matchedCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        })
      }
      if (matchedCategory.type !== cleanType) {
        return res.status(400).json({
          success: false,
          message: `Category type "${matchedCategory.type}" does not match transaction type "${cleanType}".`,
        })
      }
      transaction.categoryId = cleanCategoryId
    }

    if (accountId) {
      const matchedAccount = await Account.findOne({ _id: accountId, userId: req.userId, isActive: true })
      if (!matchedAccount) {
        return res.status(404).json({
          success: false,
          message: 'Account not found.',
        })
      }
      transaction.accountId = accountId
    }

    if (date) {
      const parsed = Date.parse(date)
      if (isNaN(parsed)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date.',
        })
      }
      transaction.date = new Date(parsed)
    }

    // Apply values (ignoring userId, createdAt modifications)
    if (type) transaction.type = type
    if (amount !== undefined) transaction.amount = amount
    if (description) transaction.description = description.trim()
    if (notes !== undefined) transaction.notes = notes.trim()

    await transaction.save()
    await transaction.populate(['categoryId', 'accountId'])

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction,
    })
  } catch (error) {
    console.error(`Error in updateTransaction: ${error.message}`)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error updating transaction.',
    })
  }
}

// Delete transaction record
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction || transaction.userId.toString() !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }

    await transaction.deleteOne()

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    })
  } catch (error) {
    console.error(`Error in deleteTransaction: ${error.message}`)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error deleting transaction.',
    })
  }
}
