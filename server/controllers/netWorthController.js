import NetWorthItem from '../models/NetWorthItem.js'
import NetWorthSnapshot from '../models/NetWorthSnapshot.js'
import Account from '../models/Account.js'
import { calculateUserNetWorth } from '../services/netWorthService.js'

// 1. Create financial item
export const createNetWorthItem = async (req, res) => {
  try {
    const { name, type, category, value, valuationDate, notes, linkedAccountId } = req.body

    if (!['asset', 'liability'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be asset or liability.' })
    }

    if (value < 0) {
      return res.status(400).json({ success: false, message: 'Value must be positive or 0.' })
    }

    const item = new NetWorthItem({
      userId: req.userId,
      name: name.trim(),
      type,
      category,
      value,
      valuationDate: valuationDate ? new Date(valuationDate) : undefined,
      notes: notes ? notes.trim() : '',
      linkedAccountId: linkedAccountId || undefined,
    })

    await item.save()

    return res.status(201).json({
      success: true,
      message: 'Financial item created successfully',
      item,
    })
  } catch (error) {
    console.error(`Error in createNetWorthItem: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error creating financial item.' })
  }
}

// 2. Fetch active user items
export const getNetWorthItems = async (req, res) => {
  try {
    const items = await NetWorthItem.find({ userId: req.userId, isActive: true })
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      items,
    })
  } catch (error) {
    console.error(`Error in getNetWorthItems: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error retrieving financial items.' })
  }
}

// 3. Get item by ID
export const getNetWorthItemById = async (req, res) => {
  try {
    const item = await NetWorthItem.findOne({ _id: req.params.id, userId: req.userId, isActive: true })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Financial item not found.' })
    }

    return res.status(200).json({
      success: true,
      item,
    })
  } catch (error) {
    console.error(`Error in getNetWorthItemById: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error retrieving financial item.' })
  }
}

// 4. Update item
export const updateNetWorthItem = async (req, res) => {
  try {
    const item = await NetWorthItem.findOne({ _id: req.params.id, userId: req.userId, isActive: true })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Financial item not found.' })
    }

    const { name, category, value, valuationDate, notes } = req.body

    if (name) item.name = name.trim()
    if (category) item.category = category
    if (value !== undefined) {
      if (value < 0) {
        return res.status(400).json({ success: false, message: 'Value must be positive or 0.' })
      }
      item.value = value
    }
    if (valuationDate) item.valuationDate = new Date(valuationDate)
    if (notes !== undefined) item.notes = notes.trim()

    await item.save()

    return res.status(200).json({
      success: true,
      message: 'Financial item updated successfully',
      item,
    })
  } catch (error) {
    console.error(`Error in updateNetWorthItem: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error updating financial item.' })
  }
}

// 5. Delete item (Soft delete)
export const deleteNetWorthItem = async (req, res) => {
  try {
    const item = await NetWorthItem.findOne({ _id: req.params.id, userId: req.userId, isActive: true })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Financial item not found.' })
    }

    item.isActive = false
    await item.save()

    return res.status(200).json({
      success: true,
      message: 'Financial item deleted successfully.',
    })
  } catch (error) {
    console.error(`Error in deleteNetWorthItem: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error deleting financial item.' })
  }
}

// 6. Fetch live net worth overview calculations
export const getOverview = async (req, res) => {
  try {
    const totals = await calculateUserNetWorth(req.userId)

    // Retrieve previous month's snapshot
    const now = new Date()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    const prevSnapshot = await NetWorthSnapshot.findOne({
      userId: req.userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd }
    })

    const previousNetWorth = prevSnapshot ? prevSnapshot.netWorth : 0
    const change = totals.netWorth - previousNetWorth
    
    let changePercentage = 0
    if (previousNetWorth !== 0) {
      changePercentage = parseFloat(((change / Math.abs(previousNetWorth)) * 100).toFixed(2))
    } else {
      changePercentage = totals.netWorth !== 0 ? 100 : 0
    }

    return res.status(200).json({
      success: true,
      overview: {
        totalAssets: totals.totalAssets,
        totalLiabilities: totals.totalLiabilities,
        netWorth: totals.netWorth,
        previousNetWorth,
        change,
        changePercentage,
      },
    })
  } catch (error) {
    console.error(`Error in getOverview net worth: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error calculating net worth overview.' })
  }
}

// 7. Fetch snapshots history
export const getHistory = async (req, res) => {
  try {
    const historyRaw = await NetWorthSnapshot.find({ userId: req.userId })
      .sort({ date: 1 }) // Chronological order

    const history = historyRaw.map((snap) => ({
      date: snap.date.toISOString().substring(0, 10),
      assets: snap.totalAssets,
      liabilities: snap.totalLiabilities,
      netWorth: snap.netWorth,
    }))

    return res.status(200).json({
      success: true,
      history,
    })
  } catch (error) {
    console.error(`Error in getHistory net worth: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error retrieving net worth history.' })
  }
}
