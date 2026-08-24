import mongoose from 'mongoose'
import Category from '../models/Category.js'
import Account from '../models/Account.js'
import { seedDefaultCategories } from './categorySeeder.js'
import { seedDefaultAccounts } from './accountSeeder.js'

export const runDatabaseMigration = async () => {
  try {
    const db = mongoose.connection.db
    const transactionsCol = db.collection('transactions')

    // Find all raw transactions
    const rawTransactions = await transactionsCol.find({}).toArray()
    console.log(`Checking ${rawTransactions.length} transactions for Category and Account migrations...`)

    let categoryMigratedCount = 0
    let accountMigratedCount = 0

    for (const tx of rawTransactions) {
      const userId = tx.userId

      // 1. Migrate Category if categoryId is missing but category string exists
      if (!tx.categoryId && tx.category) {
        const catNameString = tx.category.trim()
        const txType = tx.type || 'expense'

        // Double check default categories seeded
        await seedDefaultCategories(userId)

        let category = await Category.findOne({
          userId,
          type: txType,
          name: { $regex: new RegExp(`^${catNameString.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
        })

        if (!category) {
          category = await Category.create({
            userId,
            name: catNameString,
            type: txType,
            icon: 'FolderOpen',
            color: '#64748B',
            isDefault: false
          })
          console.log(`Created fallback category "${catNameString}" for user: ${userId}`)
        }

        await transactionsCol.updateOne(
          { _id: tx._id },
          {
            $set: { categoryId: category._id },
            $unset: { category: "" }
          }
        )
        categoryMigratedCount++
      }

      // 2. Migrate PaymentMethod -> Account if accountId is missing
      if (!tx.accountId && tx.paymentMethod) {
        // Double check default accounts seeded
        await seedDefaultAccounts(userId)

        // Map paymentMethod string values to default account names
        let targetAccountName = 'Other'
        const pm = tx.paymentMethod

        if (pm === 'Cash') {
          targetAccountName = 'Cash'
        } else if (pm === 'UPI') {
          targetAccountName = 'UPI'
        } else if (pm === 'Bank Account' || pm === 'Debit Card') {
          targetAccountName = 'Bank Account'
        } else if (pm === 'Credit Card') {
          targetAccountName = 'Credit Card'
        }

        let account = await Account.findOne({
          userId,
          name: targetAccountName,
          isActive: true
        })

        // If target account is missing, fallback to any active account or create "Other"
        if (!account) {
          account = await Account.findOne({ userId, isActive: true })
          if (!account) {
            account = await Account.create({
              userId,
              name: targetAccountName,
              type: targetAccountName === 'Credit Card' ? 'credit_card' : 'other',
              openingBalance: 0,
              icon: 'FolderOpen',
              color: '#8B5CF6',
              isActive: true
            })
            console.log(`Created fallback Account "${targetAccountName}" for user: ${userId}`)
          }
        }

        await transactionsCol.updateOne(
          { _id: tx._id },
          {
            $set: { accountId: account._id },
            $unset: { paymentMethod: "" }
          }
        )
        accountMigratedCount++
      }
    }

    if (categoryMigratedCount > 0) {
      console.log(`Migrated ${categoryMigratedCount} transaction records to Category ObjectIds!`)
    }
    if (accountMigratedCount > 0) {
      console.log(`Migrated ${accountMigratedCount} transaction records to Account ObjectIds!`)
    }

    if (categoryMigratedCount === 0 && accountMigratedCount === 0) {
      console.log('No transaction records required Category or Account migrations.')
    }
  } catch (error) {
    console.error('Database migration failed:', error.message)
  }
}
