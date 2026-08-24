import Budget from '../models/Budget.js'
import Category from '../models/Category.js'
import Transaction from '../models/Transaction.js'

// 1. Create Budget
export const createBudget = async (req, res) => {
  try {
    const { categoryId, amount, period = 'monthly', startDate, endDate, alertThreshold = 80 } = req.body

    // 1. Validate Category
    const category = await Category.findOne({ _id: categoryId, userId: req.userId })
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      })
    }

    if (category.type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: 'Budgets can only be created for expense categories.',
      })
    }

    // 2. Validate Dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid start and end dates.',
      })
    }

    // 3. Prevent duplicate active overlapping budgets
    const overlapping = await Budget.findOne({
      userId: req.userId,
      categoryId,
      isActive: true,
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    })

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'A budget already exists for this category and period.',
      })
    }

    // 4. Save
    const budget = new Budget({
      userId: req.userId,
      categoryId,
      amount,
      period,
      startDate: start,
      endDate: end,
      alertThreshold,
    })

    await budget.save()

    return res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget,
    })
  } catch (error) {
    console.error(`Error in createBudget: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error creating budget.',
    })
  }
}

// Helper to compute stats for a single budget model
const calculateBudgetStats = async (b) => {
  const txStats = await Transaction.aggregate([
    {
      $match: {
        userId: b.userId,
        categoryId: b.categoryId?._id || b.categoryId,
        type: 'expense',
        date: { $gte: b.startDate, $lte: b.endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ])

  const spent = txStats[0]?.total || 0
  const remaining = b.amount - spent
  const percentageUsed = b.amount > 0 ? parseFloat(((spent / b.amount) * 100).toFixed(2)) : 0
  
  let status = 'healthy'
  if (percentageUsed >= 100) status = 'exceeded'
  else if (percentageUsed >= b.alertThreshold) status = 'warning'

  return {
    id: b.id,
    category: {
      id: b.categoryId?._id || b.categoryId,
      name: b.categoryId?.name || 'Other',
      icon: b.categoryId?.icon || 'FolderOpen',
      color: b.categoryId?.color || '#64748B'
    },
    amount: b.amount,
    spent,
    remaining,
    percentageUsed,
    status,
    startDate: b.startDate.toISOString().substring(0, 10),
    endDate: b.endDate.toISOString().substring(0, 10),
    alertThreshold: b.alertThreshold
  }
}

// 2. Get Budgets
export const getBudgets = async (req, res) => {
  try {
    const budgetsRaw = await Budget.find({ userId: req.userId, isActive: true })
      .populate('categoryId')
      .sort({ createdAt: -1 })

    const budgets = []
    for (const b of budgetsRaw) {
      const stats = await calculateBudgetStats(b)
      budgets.push(stats)
    }

    return res.status(200).json({
      success: true,
      budgets,
    })
  } catch (error) {
    console.error(`Error in getBudgets: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving budgets.',
    })
  }
}

// 3. Get Budget by ID
export const getBudgetById = async (req, res) => {
  try {
    const budgetRaw = await Budget.findOne({ _id: req.params.id, userId: req.userId, isActive: true })
      .populate('categoryId')

    if (!budgetRaw) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.',
      })
    }

    const budget = await calculateBudgetStats(budgetRaw)

    return res.status(200).json({
      success: true,
      budget,
    })
  } catch (error) {
    console.error(`Error in getBudgetById: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving budget.',
    })
  }
}

// 4. Get Budgets Summary Report
export const getBudgetSummary = async (req, res) => {
  try {
    const budgetsRaw = await Budget.find({ userId: req.userId, isActive: true })

    let totalBudget = 0
    let totalSpent = 0
    let healthyCount = 0
    let warningCount = 0
    let exceededCount = 0

    for (const b of budgetsRaw) {
      const stats = await calculateBudgetStats(b)
      totalBudget += stats.amount
      totalSpent += stats.spent

      if (stats.status === 'exceeded') exceededCount++
      else if (stats.status === 'warning') warningCount++
      else healthyCount++
    }

    const totalRemaining = totalBudget - totalSpent
    const overallPercentageUsed = totalBudget > 0 ? parseFloat(((totalSpent / totalBudget) * 100).toFixed(2)) : 0

    return res.status(200).json({
      success: true,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentageUsed,
        healthy: healthyCount,
        warning: warningCount,
        exceeded: exceededCount,
      },
    })
  } catch (error) {
    console.error(`Error in getBudgetSummary: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error calculating budgets summary statistics.',
    })
  }
}

// 5. Update Budget
export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.userId, isActive: true })
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.',
      })
    }

    const { amount, alertThreshold, startDate, endDate } = req.body

    // Apply validation checks
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0.',
        })
      }
      budget.amount = amount
    }

    if (alertThreshold !== undefined) {
      if (typeof alertThreshold !== 'number' || alertThreshold < 1 || alertThreshold > 100) {
        return res.status(400).json({
          success: false,
          message: 'Alert threshold must be between 1 and 100.',
        })
      }
      budget.alertThreshold = alertThreshold
    }

    if (startDate) {
      const parsed = new Date(startDate)
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid startDate.',
        })
      }
      budget.startDate = parsed
    }

    if (endDate) {
      const parsed = new Date(endDate)
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid endDate.',
        })
      }
      budget.endDate = parsed
    }

    if (budget.startDate > budget.endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate cannot be after endDate.',
      })
    }

    await budget.save()

    return res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      budget,
    })
  } catch (error) {
    console.error(`Error in updateBudget: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error updating budget.',
    })
  }
}

// 6. Delete Budget
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.userId, isActive: true })
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.',
      })
    }

    // Perform soft delete
    budget.isActive = false
    await budget.save()

    return res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.',
    })
  } catch (error) {
    console.error(`Error in deleteBudget: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error deleting budget.',
    })
  }
}
