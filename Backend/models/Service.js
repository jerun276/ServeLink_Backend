import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a service title'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    pricingType: {
      type: String,
      enum: ['fixed', 'quote'],
      required: true,
    },
    fixedPrice: {
      type: Number,
      default: 0,
    },
    district: {
      type: String,
      required: [true, 'Please provide a district'],
    },
    serviceAreas: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
)

serviceSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' })

export default mongoose.model('Service', serviceSchema)
