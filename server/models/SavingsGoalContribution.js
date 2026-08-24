import mongoose from 'mongoose'

const savingsGoalContributionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Contribution amount must be greater than 0.'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Add performance indexes
savingsGoalContributionSchema.index({ userId: 1 })
savingsGoalContributionSchema.index({ goalId: 1 })
savingsGoalContributionSchema.index({ goalId: 1, date: -1 })

savingsGoalContributionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

const SavingsGoalContribution = mongoose.model('SavingsGoalContribution', savingsGoalContributionSchema)

export default SavingsGoalContribution
