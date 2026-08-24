import mongoose from 'mongoose'

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0.'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Interval must be at least 1.'],
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    occurrencesRemaining: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      default: 'active',
      enum: ['active', 'paused', 'completed', 'cancelled'],
    },
    autoCreate: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastGeneratedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Add performance indexes
recurringTransactionSchema.index({ userId: 1 })
recurringTransactionSchema.index({ userId: 1, status: 1 })
recurringTransactionSchema.index({ userId: 1, nextDueDate: 1 })
recurringTransactionSchema.index({ userId: 1, type: 1 })

// Set custom toJSON transforms to serialize ObjectId as standard string ID
recurringTransactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema)

export default RecurringTransaction
