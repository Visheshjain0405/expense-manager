import mongoose from 'mongoose'

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: [0.01, 'Target amount must be greater than 0.'],
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
    },
    icon: {
      type: String,
      required: true,
      default: 'Shield',
    },
    color: {
      type: String,
      required: true,
      default: '#2563EB',
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
)

// Add compound performance query indexes
savingsGoalSchema.index({ userId: 1 })
savingsGoalSchema.index({ userId: 1, status: 1 })

savingsGoalSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema)

export default SavingsGoal
