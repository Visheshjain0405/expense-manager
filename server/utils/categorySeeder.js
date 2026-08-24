import Category from '../models/Category.js'

const defaultExpenses = [
  { name: 'Food', icon: 'Utensils', color: '#3B82F6' },
  { name: 'Rent', icon: 'Home', color: '#6366F1' },
  { name: 'Electricity', icon: 'Zap', color: '#F59E0B' },
  { name: 'Internet', icon: 'Wifi', color: '#8B5CF6' },
  { name: 'Mobile', icon: 'Phone', color: '#10B981' },
  { name: 'Travel', icon: 'Car', color: '#F59E0B' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899' },
  { name: 'Entertainment', icon: 'Tv', color: '#EF4444' },
  { name: 'Health', icon: 'Heart', color: '#EF4444' },
  { name: 'Education', icon: 'BookOpen', color: '#3B82F6' },
  { name: 'Subscriptions', icon: 'Tv', color: '#8B5CF6' },
  { name: 'Family', icon: 'Users', color: '#10B981' },
  { name: 'EMI / Loans', icon: 'CreditCard', color: '#EF4444' },
  { name: 'Insurance', icon: 'Shield', color: '#10B981' },
  { name: 'Investments', icon: 'TrendingUp', color: '#10B981' },
  { name: 'Other', icon: 'FolderOpen', color: '#64748B' }
]

const defaultIncomes = [
  { name: 'Salary', icon: 'Briefcase', color: '#10B981' },
  { name: 'Freelancing', icon: 'Laptop', color: '#3B82F6' },
  { name: 'Business', icon: 'Store', color: '#6366F1' },
  { name: 'Interest', icon: 'Coins', color: '#F59E0B' },
  { name: 'Cashback', icon: 'Tag', color: '#EC4899' },
  { name: 'Refund', icon: 'RotateCcw', color: '#64748B' },
  { name: 'Other', icon: 'FolderOpen', color: '#64748B' }
]

export const seedDefaultCategories = async (userId) => {
  try {
    const existingCount = await Category.countDocuments({ userId })
    if (existingCount > 0) {
      return // Categories already seeded
    }

    const categoriesToCreate = []

    defaultExpenses.forEach((cat) => {
      categoriesToCreate.push({
        userId,
        name: cat.name,
        type: 'expense',
        icon: cat.icon,
        color: cat.color,
        isDefault: true
      })
    })

    defaultIncomes.forEach((cat) => {
      categoriesToCreate.push({
        userId,
        name: cat.name,
        type: 'income',
        icon: cat.icon,
        color: cat.color,
        isDefault: true
      })
    })

    await Category.insertMany(categoriesToCreate)
    console.log(`Default categories successfully seeded for user: ${userId}`)
  } catch (error) {
    console.error(`Failed to seed default categories for user ${userId}:`, error.message)
  }
}
