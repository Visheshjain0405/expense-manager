import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
      required: [true, 'Category type is required'],
    },
    icon: {
      type: String,
      default: 'FolderOpen',
    },
    color: {
      type: String,
      default: '#64748B',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure compound uniqueness of Category Name for the same user and type
categorySchema.index({ userId: 1, type: 1, name: 1 }, { unique: true })

// Configure JSON transformer to strip Mongo keys and format output
categorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

const Category = mongoose.model('Category', categorySchema)

export default Category
