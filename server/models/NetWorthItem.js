import mongoose from 'mongoose'

const netWorthItemSchema = new mongoose.Schema(
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
    type: {
      type: String,
      required: true,
      enum: ['asset', 'liability'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'cash',
        'property',
        'vehicle',
        'gold',
        'investment',
        'fixed_deposit',
        'provident_fund',
        'other_asset',
        'credit_card',
        'personal_loan',
        'home_loan',
        'education_loan',
        'vehicle_loan',
        'other_liability'
      ],
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Value must be positive or 0.'],
    },
    linkedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    notes: {
      type: String,
      trim: true,
    },
    valuationDate: {
      type: Date,
      required: true,
      default: Date.now,
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
netWorthItemSchema.index({ userId: 1 })
netWorthItemSchema.index({ userId: 1, type: 1 })
netWorthItemSchema.index({ userId: 1, category: 1 })

// Set custom toJSON transforms
netWorthItemSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

const NetWorthItem = mongoose.model('NetWorthItem', netWorthItemSchema)

export default NetWorthItem
