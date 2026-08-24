import User from '../models/User.js'
import Account from '../models/Account.js'
import Transaction from '../models/Transaction.js'
import NetWorthItem from '../models/NetWorthItem.js'
import NetWorthSnapshot from '../models/NetWorthSnapshot.js'

// Helper to compute user's current absolute net worth aggregates
export const calculateUserNetWorth = async (userId) => {
  // 1. Calculate Account Balances
  const activeAccounts = await Account.find({ userId, isActive: true })
  let accountAssets = 0
  let accountLiabilities = 0

  for (const acc of activeAccounts) {
    const txStats = await Transaction.aggregate([
      { $match: { accountId: acc._id } },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      }
    ])
    const summary = txStats[0] || { income: 0, expense: 0 }
    const currentBalance = acc.openingBalance + summary.income - summary.expense

    if (currentBalance > 0) {
      accountAssets += currentBalance
    } else if (currentBalance < 0) {
      accountLiabilities += Math.abs(currentBalance)
    }
  }

  // 2. Calculate Manual Net Worth Items
  const items = await NetWorthItem.find({ userId, isActive: true })
  let itemAssets = 0
  let itemLiabilities = 0

  for (const item of items) {
    if (item.type === 'asset') {
      itemAssets += item.value
    } else if (item.type === 'liability') {
      itemLiabilities += item.value
    }
  }

  const totalAssets = accountAssets + itemAssets
  const totalLiabilities = accountLiabilities + itemLiabilities
  const netWorth = totalAssets - totalLiabilities

  return { totalAssets, totalLiabilities, netWorth }
}

// Background scheduler runner executing daily
export const runNetWorthSnapshotJob = async () => {
  console.log('Running daily net worth snapshot scheduler job...')
  const now = new Date()
  
  // Format Date to last day of current month (set to midnight)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  lastDay.setHours(23, 59, 59, 999)

  try {
    const users = await User.find({})
    console.log(`Found ${users.length} users to inspect for monthly net worth snapshots.`)

    for (const user of users) {
      // Start/End boundaries checking for the current month snapshot
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      const existingSnapshot = await NetWorthSnapshot.findOne({
        userId: user._id,
        date: { $gte: monthStart, $lte: monthEnd }
      })

      if (!existingSnapshot) {
        console.log(`Creating snapshot record for user ${user.email} for date ${monthEnd.toISOString().substring(0, 10)}`)
        
        const totals = await calculateUserNetWorth(user._id)
        
        const snapshot = new NetWorthSnapshot({
          userId: user._id,
          date: monthEnd,
          totalAssets: totals.totalAssets,
          totalLiabilities: totals.totalLiabilities,
          netWorth: totals.netWorth
        })

        await snapshot.save()
      }
    }

    console.log('Finished running net worth snapshot job.')
  } catch (err) {
    console.error(`Error in runNetWorthSnapshotJob: ${err.message}`)
  }
}
