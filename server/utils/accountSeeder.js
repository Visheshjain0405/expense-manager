import Account from '../models/Account.js'

const defaultAccounts = [
  { name: 'Cash', type: 'cash', icon: 'Coins', color: '#64748B' },
  { name: 'Bank Account', type: 'bank', icon: 'Landmark', color: '#3B82F6' },
  { name: 'UPI', type: 'upi', icon: 'Coins', color: '#10B981' },
  { name: 'Credit Card', type: 'credit_card', icon: 'CreditCard', color: '#EF4444' },
  { name: 'Other', type: 'other', icon: 'FolderOpen', color: '#8B5CF6' }
]

export const seedDefaultAccounts = async (userId) => {
  try {
    const existingCount = await Account.countDocuments({ userId })
    if (existingCount > 0) {
      return // Accounts already seeded
    }

    const accountsToCreate = defaultAccounts.map((acc) => ({
      userId,
      name: acc.name,
      type: acc.type,
      openingBalance: 0,
      icon: acc.icon,
      color: acc.color,
      isActive: true
    }))

    await Account.insertMany(accountsToCreate)
    console.log(`Default accounts successfully seeded for user: ${userId}`)
  } catch (error) {
    console.error(`Failed to seed default accounts for user ${userId}:`, error.message)
  }
}
