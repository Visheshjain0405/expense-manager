import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      minlength: [2, 'Account name must be at least 2 characters'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'cash',
          'bank',
          'upi',
          'credit_card',
          'debit_card',
          'wallet',
          'investment',
          'other',
        ],
        message: 'Invalid account type',
      },
      required: [true, 'Account type is required'],
    },
    icon: {
      type: String,
      default: 'Landmark',
    },
    color: {
      type: String,
      default: '#64748B',
    },
    openingBalance: {
      type: Number,
      required: [true, 'Opening balance is required'],
      min: [0, 'Opening balance must be 0 or positive'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique index to prevent duplicate accounts for the same user
accountSchema.index({ userId: 1, name: 1 }, { unique: true })

// Configure toJSON transform
accountSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

const Account = mongoose.model('Account', accountSchema)

export default Account
