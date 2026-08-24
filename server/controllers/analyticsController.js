import mongoose from 'mongoose'
import Transaction from '../models/Transaction.js'
import Category from '../models/Category.js'
import Account from '../models/Account.js'

// Helper to resolve start and end date boundaries
const getDates = (req) => {
  const { startDate, endDate } = req.query
  let start, end

  if (startDate) {
    start = new Date(startDate)
  } else {
    const now = new Date()
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  if (endDate) {
    end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
  } else {
    const now = new Date()
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  return { start, end }
}

// Helper to compute percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }
  return parseFloat((((current - previous) / previous) * 100).toFixed(2))
}

// 1. Overview API
export const getOverview = async (req, res) => {
  try {
    const { start, end } = getDates(req)
    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    // Duration of current period
    const durationMs = end.getTime() - start.getTime()
    const prevStart = new Date(start.getTime() - durationMs - 1)
    const prevEnd = new Date(start.getTime() - 1)

    // Query aggregates for current period
    const currentStats = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          transactionCount: { $sum: 1 },
          largestExpense: {
            $max: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
    ])

    // Query aggregates for previous comparison period
    const previousStats = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: prevStart, $lte: prevEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
    ])

    const curr = currentStats[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      transactionCount: 0,
      largestExpense: 0,
    }

    const prev = previousStats[0] || {
      totalIncome: 0,
      totalExpenses: 0,
    }

    const netSavings = curr.totalIncome - curr.totalExpenses
    const prevSavings = prev.totalIncome - prev.totalExpenses
    const savingsRate = curr.totalIncome > 0 ? parseFloat(((netSavings / curr.totalIncome) * 100).toFixed(2)) : 0

    // Average daily expense
    const diffDays = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24)) + 1)
    const averageDailyExpense = parseFloat((curr.totalExpenses / diffDays).toFixed(2))

    // Ratios change comparison
    const incomeChangePercent = calculatePercentageChange(curr.totalIncome, prev.totalIncome)
    const expenseChangePercent = calculatePercentageChange(curr.totalExpenses, prev.totalExpenses)
    const savingsChangePercent = calculatePercentageChange(netSavings, prevSavings)

    return res.status(200).json({
      success: true,
      overview: {
        totalIncome: curr.totalIncome,
        totalExpenses: curr.totalExpenses,
        netSavings,
        savingsRate,
        transactionCount: curr.transactionCount,
        averageDailyExpense,
        largestExpense: curr.largestExpense,
        incomeChangePercent,
        expenseChangePercent,
        savingsChangePercent,
      },
    })
  } catch (error) {
    console.error(`Error in getOverview analytics: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error loading analytics overview.',
    })
  }
}

// 2. Monthly Analytics
export const getMonthly = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId)
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    const { start, end } = req.query.startDate
      ? getDates(req)
      : { start: twelveMonthsAgo, end: now }

    const data = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          income: 1,
          expense: 1,
          savings: { $subtract: ['$income', '$expense'] },
        },
      },
      { $sort: { month: 1 } },
    ])

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error(`Error in getMonthly analytics: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error loading monthly analytics.',
    })
  }
}

// 3. Category Expense Breakdown
export const getCategoryAnalytics = async (req, res) => {
  try {
    const { start, end } = getDates(req)
    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    // 1. Fetch total expenses for the period to calculate percentages
    const totalExpensesQuery = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    const totalExpenses = totalExpensesQuery[0]?.total || 0

    // 2. Fetch breakdown details
    const categoriesRaw = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { amount: -1 } },
    ])

    // Populate category names manually or via loop to format percentages
    const categories = []
    for (const c of categoriesRaw) {
      const catObj = await Category.findById(c._id)
      const name = catObj ? catObj.name : 'Other'
      const color = catObj ? catObj.color : '#64748B'
      const icon = catObj ? catObj.icon : 'FolderOpen'
      const percentage = totalExpenses > 0 ? parseFloat(((c.amount / totalExpenses) * 100).toFixed(2)) : 0

      categories.push({
        categoryId: c._id ? c._id.toString() : 'other',
        name,
        color,
        icon,
        amount: c.amount,
        percentage,
      })
    }

    return res.status(200).json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error(`Error in getCategoryAnalytics: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error loading category breakdown.',
    })
  }
}

// 4. Account Distribution
export const getAccountAnalytics = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    const activeAccounts = await Account.find({ userId: req.userId, isActive: true })

    const accounts = []
    for (const acc of activeAccounts) {
      const txStats = await Transaction.aggregate([
        { $match: { accountId: acc._id } },
        {
          $group: {
            _id: null,
            income: {
              $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
            },
            expense: {
              $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
            },
          },
        },
      ])

      const summary = txStats[0] || { income: 0, expense: 0 }
      const balance = acc.openingBalance + summary.income - summary.expense

      accounts.push({
        accountId: acc.id,
        name: acc.name,
        color: acc.color,
        icon: acc.icon,
        income: summary.income,
        expense: summary.expense,
        balance,
      })
    }

    return res.status(200).json({
      success: true,
      accounts,
    })
  } catch (error) {
    console.error(`Error in getAccountAnalytics: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error loading account distribution.',
    })
  }
}

// 5. Daily Spending Breakdown (Expenses only)
export const getDaily = async (req, res) => {
  try {
    const { start, end } = getDates(req)
    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    const dailyStats = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          expense: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const data = dailyStats.map((item) => ({
      date: item._id,
      expense: item.expense,
    }))

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error(`Error in getDaily analytics: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error loading daily spending trends.',
    })
  }
}

// 6. Top Expenses
export const getTopExpenses = async (req, res) => {
  try {
    const { start, end } = getDates(req)
    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    let limitNum = parseInt(req.query.limit) || 10
    limitNum = Math.min(50, Math.max(1, limitNum))

    const rawExpenses = await Transaction.find({
      userId: req.userId,
      type: 'expense',
      date: { $gte: start, $lte: end },
    })
      .sort({ amount: -1 })
      .limit(limitNum)
      .populate('categoryId')

    const expenses = rawExpenses.map((tx) => ({
      id: tx.id,
      description: tx.description,
      amount: tx.amount,
      category: tx.categoryId ? tx.categoryId.name : 'Other',
      color: tx.categoryId ? tx.categoryId.color : '#64748B',
      date: tx.date.toISOString().substring(0, 10),
    }))

    return res.status(200).json({
      success: true,
      expenses,
    })
  } catch (error) {
    console.error(`Error in getTopExpenses analytics: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving largest expenses.',
    })
  }
}

// 7. Structured rule-based insights
export const getInsights = async (req, res) => {
  try {
    const { start, end } = getDates(req)
    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    // Fetch Overview metrics
    const statsQuery = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          largestExpense: {
            $max: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
    ])

    const stats = statsQuery[0] || { totalIncome: 0, totalExpenses: 0, largestExpense: 0 }
    const netSavings = stats.totalIncome - stats.totalExpenses

    const durationMs = end.getTime() - start.getTime()
    const diffDays = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24)) + 1)
    const dailyAverage = Math.round(stats.totalExpenses / diffDays)

    const insights = []

    // 1. Savings insights card
    if (stats.totalIncome > 0) {
      const rate = ((netSavings / stats.totalIncome) * 100).toFixed(1)
      insights.push({
        type: 'savings',
        severity: netSavings > 0 ? 'success' : 'warning',
        title: 'Monthly Savings Rate',
        message: `You saved ${rate}% of your income this month (Total saved: ₹${netSavings.toLocaleString('en-IN')}).`,
      })
    }

    // 2. Largest Category insights card
    const categoryQuery = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ])

    if (categoryQuery.length > 0 && stats.totalExpenses > 0) {
      const catObj = await Category.findById(categoryQuery[0]._id)
      const name = catObj ? catObj.name : 'Other'
      const ratio = ((categoryQuery[0].total / stats.totalExpenses) * 100).toFixed(1)

      insights.push({
        type: 'category',
        severity: 'info',
        title: 'Highest Spending Category',
        message: `${name} is your highest spending category this month, accounting for ${ratio}% of your expenses.`,
      })
    }

    // 3. Average daily spent card
    if (stats.totalExpenses > 0) {
      insights.push({
        type: 'spending',
        severity: 'info',
        title: 'Average Daily Spending',
        message: `Your average daily spending is ₹${dailyAverage.toLocaleString('en-IN')} across this period.`,
      })
    }

    // 4. Largest single bill card
    if (stats.largestExpense > 0) {
      insights.push({
        type: 'largest_expense',
        severity: 'warning',
        title: 'Largest Expense log',
        message: `Your largest single expense this month was ₹${stats.largestExpense.toLocaleString('en-IN')}.`,
      })
    }

    return res.status(200).json({
      success: true,
      insights,
    })
  } catch (error) {
    console.error(`Error in getInsights: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error loading insights.',
    })
  }
}
