import Transaction from '../models/Transaction.js'
import Category from '../models/Category.js'
import Account from '../models/Account.js'
import Budget from '../models/Budget.js'
import SavingsGoal from '../models/SavingsGoal.js'
import { calculateUserNetWorth } from '../services/netWorthService.js'

// 1. Live reports summary aggregates
export const getReportSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.userId

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required.' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const dateQuery = { userId, date: { $gte: start, $lte: end } }

    // 1. Transaction Summary
    const txSummary = await Transaction.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          totalTx: { $sum: 1 },
          incomeCount: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, 1, 0] } },
          expenseCount: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, 1, 0] } },
        }
      }
    ])
    const { income = 0, expenses = 0, totalTx = 0, incomeCount = 0, expenseCount = 0 } = txSummary[0] || {}
    const savings = Math.max(0, income - expenses)
    const savingsRate = income > 0 ? parseFloat(((savings / income) * 100).toFixed(2)) : 0

    // 2. Category aggregates
    const categories = await Category.find({ userId })
    const catMap = {}
    categories.forEach(c => { catMap[c._id.toString()] = c })

    const categoryStats = await Transaction.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { categoryId: '$categoryId', type: '$type' },
          amount: { $sum: '$amount' }
        }
      }
    ])

    const incomeByCategory = []
    const expensesByCategory = []

    categoryStats.forEach(stat => {
      const catId = stat._id.categoryId?.toString()
      const cat = catMap[catId] || { name: 'Uncategorized', color: '#64748B', icon: 'FolderOpen' }
      const item = {
        id: catId,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        amount: stat.amount,
      }
      if (stat._id.type === 'income') {
        incomeByCategory.push(item)
      } else {
        expensesByCategory.push(item)
      }
    })

    // Sort by amount descending & compute percentages
    incomeByCategory.sort((a, b) => b.amount - a.amount)
    const totalIncomeCat = incomeByCategory.reduce((sum, item) => sum + item.amount, 0)
    incomeByCategory.forEach(item => {
      item.percentage = totalIncomeCat > 0 ? parseFloat(((item.amount / totalIncomeCat) * 100).toFixed(2)) : 0
    })

    expensesByCategory.sort((a, b) => b.amount - a.amount)
    const totalExpenseCat = expensesByCategory.reduce((sum, item) => sum + item.amount, 0)
    expensesByCategory.forEach(item => {
      item.percentage = totalExpenseCat > 0 ? parseFloat(((item.amount / totalExpenseCat) * 100).toFixed(2)) : 0
    })

    // 3. Account Activity Summary
    const accounts = await Account.find({ userId, isActive: true })
    const accountSummary = []
    for (const acc of accounts) {
      const stats = await Transaction.aggregate([
        { $match: { accountId: acc._id, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
            expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          }
        }
      ])

      const liveStats = await Transaction.aggregate([
        { $match: { accountId: acc._id } },
        {
          $group: {
            _id: null,
            income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
            expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          }
        }
      ])
      const liveSummary = liveStats[0] || { income: 0, expense: 0 }
      const balance = acc.openingBalance + liveSummary.income - liveSummary.expense

      const s = stats[0] || { income: 0, expense: 0 }
      accountSummary.push({
        id: acc._id.toString(),
        name: acc.name,
        income: s.income,
        expense: s.expense,
        balance,
      })
    }

    // 4. Monthly trend
    const monthlyStats = await Transaction.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
    const monthlyTrend = monthlyStats.map(stat => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const label = `${monthNames[stat._id.month - 1]} ${stat._id.year}`
      const savings = Math.max(0, stat.income - stat.expense)
      return {
        label,
        income: stat.income,
        expense: stat.expense,
        savings,
      }
    })

    // 5. Top 10 Expenses
    const topExpensesRaw = await Transaction.find({ ...dateQuery, type: 'expense' })
      .populate('accountId', 'name')
      .populate('categoryId', 'name')
      .sort({ amount: -1 })
      .limit(10)

    const topExpenses = topExpensesRaw.map(tx => ({
      id: tx._id.toString(),
      description: tx.description,
      category: tx.categoryId?.name || 'Category',
      account: tx.accountId?.name || 'Account',
      date: tx.date,
      amount: tx.amount,
    }))

    // 6. Budgets Performance
    const activeBudgets = await Budget.find({ userId })
      .populate('categoryId', 'name')

    const budgetPerformance = []
    for (const b of activeBudgets) {
      const spentStats = await Transaction.aggregate([
        { 
          $match: { 
            userId,
            categoryId: b.categoryId?._id,
            type: 'expense',
            date: { $gte: start, $lte: end }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      const spent = spentStats[0]?.total || 0
      const remaining = b.limit - spent
      
      let status = 'Healthy'
      const usagePercent = (spent / b.limit) * 100
      if (usagePercent >= 100) status = 'Exceeded'
      else if (usagePercent >= 80) status = 'Warning'

      budgetPerformance.push({
        id: b._id.toString(),
        category: b.categoryId?.name || 'Category',
        limit: b.limit,
        spent,
        remaining,
        status,
      })
    }

    // 7. Savings Goals Summary
    const goals = await SavingsGoal.find({ userId })
    const savingsGoals = goals.map(g => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount)
      const progress = Math.round((g.currentAmount / g.targetAmount) * 100)
      return {
        id: g._id.toString(),
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remainingAmount: remaining,
        progressPercentage: progress,
        status: g.status,
      }
    })

    // 8. Net Worth Aggregates
    const netWorth = await calculateUserNetWorth(userId)

    return res.status(200).json({
      success: true,
      period: {
        startDate: startDate,
        endDate: endDate,
      },
      summary: {
        income,
        expenses,
        savings,
        savingsRate,
        totalTx,
        incomeCount,
        expenseCount,
      },
      incomeByCategory,
      expensesByCategory,
      accountSummary,
      monthlyTrend,
      topExpenses,
      budgetPerformance,
      savingsGoals,
      netWorth,
    })
  } catch (error) {
    console.error(`Error generating report summary: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error generating reports summary.' })
  }
}

// 2. Fetch all raw transactions during period for export
export const exportTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.userId

    const query = { userId }
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) }
    }

    const transactions = await Transaction.find(query)
      .populate('accountId', 'name')
      .populate('categoryId', 'name')
      .sort({ date: -1 })

    const list = transactions.map(t => ({
      date: t.date.toISOString().substring(0, 10),
      type: t.type,
      description: t.description,
      category: t.categoryId?.name || 'Category',
      account: t.accountId?.name || 'Account',
      amount: t.amount,
      notes: t.notes || '',
    }))

    return res.status(200).json({
      success: true,
      transactions: list,
    })
  } catch (error) {
    console.error(`Error fetching export transactions: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error fetching export transactions.' })
  }
}
