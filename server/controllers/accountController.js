import mongoose from 'mongoose'
import Account from '../models/Account.js'
import Transaction from '../models/Transaction.js'

// Create new Account
export const createAccount = async (req, res) => {
  try {
    const { name, type, openingBalance, icon, color } = req.body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Account name is required and must be at least 2 characters.',
      })
    }

    const allowedTypes = [
      'cash',
      'bank',
      'upi',
      'credit_card',
      'debit_card',
      'wallet',
      'investment',
      'other',
    ]
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'A valid account type is required.',
      })
    }

    const parsedOpeningBalance = openingBalance !== undefined ? parseFloat(openingBalance) : 0
    if (isNaN(parsedOpeningBalance) || parsedOpeningBalance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Opening balance must be 0 or positive.',
      })
    }

    const cleanName = name.trim()

    // Case-insensitive duplicate account name check for the same user
    const accountExists = await Account.findOne({
      userId: req.userId,
      name: { $regex: new RegExp(`^${cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
    })

    if (accountExists) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists',
      })
    }

    const account = await Account.create({
      userId: req.userId,
      name: cleanName,
      type,
      openingBalance: parsedOpeningBalance,
      icon: icon || 'Landmark',
      color: color || '#64748B',
      isActive: true,
    })

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      account,
    })
  } catch (error) {
    console.error(`Error in createAccount: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error creating account.',
    })
  }
}

// Get user accounts with aggregated balances
export const getAccounts = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    const accounts = await Account.aggregate([
      { $match: { userId: userObjectId, isActive: true } },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'accountId',
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
          openingBalance: 1,
          isActive: 1,
          transactionCount: { $size: '$transactions' },
          currentBalance: {
            $subtract: [
              {
                $add: [
                  '$openingBalance',
                  {
                    $sum: {
                      $map: {
                        input: '$transactions',
                        as: 't',
                        in: { $cond: [{ $eq: ['$$t.type', 'income'] }, '$$t.amount', 0] },
                      },
                    },
                  },
                ],
              },
              {
                $sum: {
                  $map: {
                    input: '$transactions',
                    as: 't',
                    in: { $cond: [{ $eq: ['$$t.type', 'expense'] }, '$$t.amount', 0] },
                  },
                },
              },
            ],
          },
        },
      },
      { $sort: { name: 1 } },
    ])

    const formattedAccounts = accounts.map((acc) => {
      acc.id = acc._id.toString()
      delete acc._id
      return acc
    })

    return res.status(200).json({
      success: true,
      accounts: formattedAccounts,
    })
  } catch (error) {
    console.error(`Error in getAccounts: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving accounts.',
    })
  }
}

// Get single Account details with calculated metrics
export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId, isActive: true })

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      })
    }

    // Query stats using dynamic transaction aggregates
    const stats = await Transaction.aggregate([
      { $match: { accountId: account._id } },
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
        },
      },
    ])

    const summary = stats[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      transactionCount: 0,
    }

    const currentBalance = account.openingBalance + summary.totalIncome - summary.totalExpenses

    return res.status(200).json({
      success: true,
      account: {
        id: account.id,
        name: account.name,
        type: account.type,
        icon: account.icon,
        color: account.color,
        openingBalance: account.openingBalance,
        currentBalance,
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        transactionCount: summary.transactionCount,
      },
    })
  } catch (error) {
    console.error(`Error in getAccountById: ${error.message}`)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving account details.',
    })
  }
}

// Update Account details
export const updateAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId, isActive: true })

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      })
    }

    const { name, type, openingBalance, icon, color } = req.body

    const cleanName = name ? name.trim() : account.name
    const targetType = type || account.type

    // Validate name uniqueness if changing
    if (name && cleanName !== account.name) {
      const accountExists = await Account.findOne({
        _id: { $ne: account._id },
        userId: req.userId,
        name: { $regex: new RegExp(`^${cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      })

      if (accountExists) {
        return res.status(400).json({
          success: false,
          message: 'Account name already exists.',
        })
      }
    }

    // Verify opening balance updates logic
    if (openingBalance !== undefined) {
      const parsedBalance = parseFloat(openingBalance)
      if (isNaN(parsedBalance) || parsedBalance < 0) {
        return res.status(400).json({
          success: false,
          message: 'Opening balance must be 0 or positive.',
        })
      }

      if (parsedBalance !== account.openingBalance) {
        // Count if transactions exist
        const transactionCount = await Transaction.countDocuments({ accountId: account._id })
        if (transactionCount > 0) {
          return res.status(400).json({
            success: false,
            message: 'Opening balance cannot be changed after transactions have been recorded.',
          })
        }
        account.openingBalance = parsedBalance
      }
    }

    if (name) account.name = cleanName
    if (type) {
      const allowedTypes = [
        'cash',
        'bank',
        'upi',
        'credit_card',
        'debit_card',
        'wallet',
        'investment',
        'other',
      ]
      if (allowedTypes.includes(type)) {
        account.type = type
      }
    }
    if (icon) account.icon = icon
    if (color) account.color = color

    await account.save()

    return res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      account,
    })
  } catch (error) {
    console.error(`Error in updateAccount: ${error.message}`)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error updating account.',
    })
  }
}

// Delete Account (Soft Delete via isActive: false)
export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId, isActive: true })

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      })
    }

    // Rejects deletion if account has transactions referencing it
    const transactionReferenced = await Transaction.findOne({ accountId: account._id })
    if (transactionReferenced) {
      return res.status(400).json({
        success: false,
        message: 'This account cannot be deleted because it has transactions.',
      })
    }

    // soft-delete account
    account.isActive = false
    await account.save()

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error(`Error in deleteAccount: ${error.message}`)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Server error deleting account.',
    })
  }
}
