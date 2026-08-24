import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0.'],
    },
    period: {
      type: String,
      required: true,
      default: 'monthly',
      enum: ['weekly', 'monthly', 'yearly', 'custom'],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    alertThreshold: {
      type: Number,
      required: true,
      default: 80,
      min: [1, 'Threshold must be at least 1%.'],
      max: [100, 'Threshold cannot exceed 100%.'],
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Add performance indexes
budgetSchema.index({ userId: 1 })
budgetSchema.index({ userId: 1, categoryId: 1 })
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 })

const Budget = mongoose.model('Budget', budgetSchema)

export default Budget
