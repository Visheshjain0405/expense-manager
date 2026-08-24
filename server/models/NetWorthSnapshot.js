import mongoose from 'mongoose'

const netWorthSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalAssets: {
      type: Number,
      required: true,
    },
    totalLiabilities: {
      type: Number,
      required: true,
    },
    netWorth: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique index to prevent duplicate monthly snapshots for the same user
netWorthSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true })

netWorthSnapshotSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

const NetWorthSnapshot = mongoose.model('NetWorthSnapshot', netWorthSnapshotSchema)

export default NetWorthSnapshot
