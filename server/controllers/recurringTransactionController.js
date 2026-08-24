import RecurringTransaction from '../models/RecurringTransaction.js'
import Category from '../models/Category.js'
import Account from '../models/Account.js'

// Helper to validate category & account ownership
const validateOwnership = async (userId, categoryId, accountId, type) => {
  const category = await Category.findOne({ _id: categoryId, userId })
  if (!category) {
    return { valid: false, message: 'Category not found.' }
  }
  if (category.type !== type) {
    return { valid: false, message: `Category type "${category.type}" does not match transaction type "${type}".` }
  }

  const account = await Account.findOne({ _id: accountId, userId, isActive: true })
  if (!account) {
    return { valid: false, message: 'Active account not found.' }
  }

  return { valid: true }
}

// 1. Create schedule template
export const createRecurringTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      categoryId,
      accountId,
      description,
      notes,
      frequency,
      interval = 1,
      startDate,
      endDate,
      occurrencesRemaining,
      autoCreate = true,
    } = req.body

    // 1. Validation guards
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be income or expense.' })
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
      return res.status(400).json({ success: false, message: 'Frequency must be daily, weekly, monthly, or yearly.' })
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' })
    }

    if (interval < 1) {
      return res.status(400).json({ success: false, message: 'Interval must be at least 1.' })
    }

    const check = await validateOwnership(req.userId, categoryId, accountId, type)
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message })
    }

    const start = new Date(startDate)
    if (isNaN(start.getTime())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid start date.' })
    }

    const schedule = new RecurringTransaction({
      userId: req.userId,
      type,
      amount,
      categoryId,
      accountId,
      description: description.trim(),
      notes: notes ? notes.trim() : '',
      frequency,
      interval,
      startDate: start,
      nextDueDate: start, // Initial value maps to start date
      endDate: endDate ? new Date(endDate) : undefined,
      occurrencesRemaining,
      autoCreate,
      status: 'active',
    })

    await schedule.save()

    return res.status(201).json({
      success: true,
      message: 'Recurring transaction template created successfully',
      recurringTransaction: schedule,
    })
  } catch (error) {
    console.error(`Error in createRecurringTransaction: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error creating recurring template.' })
  }
}

// 2. Fetch templates list
export const getRecurringTransactions = async (req, res) => {
  try {
    const filter = { userId: req.userId }
    if (req.query.status) filter.status = req.query.status
    if (req.query.type) filter.type = req.query.type
    if (req.query.frequency) filter.frequency = req.query.frequency

    const list = await RecurringTransaction.find(filter)
      .populate('categoryId')
      .populate('accountId')
      .sort({ createdAt: -1 })

    const recurringTransactions = list.map((item) => ({
      id: item.id,
      description: item.description,
      amount: item.amount,
      type: item.type,
      frequency: item.frequency,
      interval: item.interval,
      nextDueDate: item.nextDueDate.toISOString().substring(0, 10),
      endDate: item.endDate ? item.endDate.toISOString().substring(0, 10) : null,
      occurrencesRemaining: item.occurrencesRemaining,
      status: item.status,
      category: {
        id: item.categoryId?.id || item.categoryId,
        name: item.categoryId?.name || 'Other',
        color: item.categoryId?.color || '#64748B',
        icon: item.categoryId?.icon || 'FolderOpen',
      },
      account: {
        id: item.accountId?.id || item.accountId,
        name: item.accountId?.name || 'Other',
        color: item.accountId?.color || '#3B82F6',
        icon: item.accountId?.icon || 'Landmark',
      },
    }))

    return res.status(200).json({
      success: true,
      recurringTransactions,
    })
  } catch (error) {
    console.error(`Error in getRecurringTransactions: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error retrieving templates.' })
  }
}

// 3. Fetch single details
export const getRecurringTransactionById = async (req, res) => {
  try {
    const item = await RecurringTransaction.findOne({ _id: req.params.id, userId: req.userId })
      .populate('categoryId')
      .populate('accountId')

    if (!item) {
      return res.status(404).json({ success: false, message: 'Recurring transaction template not found.' })
    }

    return res.status(200).json({
      success: true,
      recurringTransaction: item,
    })
  } catch (error) {
    console.error(`Error in getRecurringTransactionById: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error retrieving template.' })
  }
}

// 4. Update template
export const updateRecurringTransaction = async (req, res) => {
  try {
    const item = await RecurringTransaction.findOne({ _id: req.params.id, userId: req.userId })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Recurring transaction template not found.' })
    }

    const {
      amount,
      categoryId,
      accountId,
      description,
      notes,
      frequency,
      interval,
      nextDueDate,
      endDate,
      occurrencesRemaining,
      autoCreate,
    } = req.body

    const cleanType = item.type
    const cleanCategoryId = categoryId || item.categoryId
    const cleanAccountId = accountId || item.accountId

    // Validate mappings changes
    if (categoryId || accountId) {
      const check = await validateOwnership(req.userId, cleanCategoryId, cleanAccountId, cleanType)
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.message })
      }
      item.categoryId = cleanCategoryId
      item.accountId = cleanAccountId
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' })
      }
      item.amount = amount
    }

    if (interval !== undefined) {
      if (interval < 1) {
        return res.status(400).json({ success: false, message: 'Interval must be at least 1.' })
      }
      item.interval = interval
    }

    if (description) item.description = description.trim()
    if (notes !== undefined) item.notes = notes.trim()
    if (frequency) item.frequency = frequency

    if (nextDueDate) {
      const parsed = new Date(nextDueDate)
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid nextDueDate.' })
      }
      item.nextDueDate = parsed
    }

    if (endDate !== undefined) {
      item.endDate = endDate ? new Date(endDate) : undefined
    }

    if (occurrencesRemaining !== undefined) {
      item.occurrencesRemaining = occurrencesRemaining
    }

    if (autoCreate !== undefined) {
      item.autoCreate = autoCreate
    }

    await item.save()

    return res.status(200).json({
      success: true,
      message: 'Recurring template updated successfully',
      recurringTransaction: item,
    })
  } catch (error) {
    console.error(`Error in updateRecurringTransaction: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error updating template.' })
  }
}

// 5. Pause template
export const pauseRecurringTransaction = async (req, res) => {
  try {
    const item = await RecurringTransaction.findOne({ _id: req.params.id, userId: req.userId })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Template not found.' })
    }

    item.status = 'paused'
    await item.save()

    return res.status(200).json({ success: true, message: 'Recurring template paused successfully.' })
  } catch (error) {
    console.error(`Error in pauseRecurringTransaction: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error pausing schedule.' })
  }
}

// 6. Resume template
export const resumeRecurringTransaction = async (req, res) => {
  try {
    const item = await RecurringTransaction.findOne({ _id: req.params.id, userId: req.userId })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Template not found.' })
    }

    item.status = 'active'
    await item.save()

    return res.status(200).json({ success: true, message: 'Recurring template resumed successfully.' })
  } catch (error) {
    console.error(`Error in resumeRecurringTransaction: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error resuming schedule.' })
  }
}

// 7. Cancel template
export const cancelRecurringTransaction = async (req, res) => {
  try {
    const item = await RecurringTransaction.findOne({ _id: req.params.id, userId: req.userId })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Template not found.' })
    }

    item.status = 'cancelled'
    await item.save()

    return res.status(200).json({ success: true, message: 'Recurring template cancelled successfully.' })
  } catch (error) {
    console.error(`Error in cancelRecurringTransaction: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error cancelling schedule.' })
  }
}

// 8. Physical Delete template
export const deleteRecurringTransaction = async (req, res) => {
  try {
    const item = await RecurringTransaction.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Template not found.' })
    }

    return res.status(200).json({ success: true, message: 'Recurring template deleted successfully. Generated transactions are preserved.' })
  } catch (error) {
    console.error(`Error in deleteRecurringTransaction: ${error.message}`)
    return res.status(500).json({ success: false, message: 'Server error deleting template.' })
  }
}
