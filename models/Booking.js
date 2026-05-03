import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Please provide a scheduled date'],
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
    },
    district: {
      type: String,
      required: [true, 'Please provide a district'],
    },
    notes: {
      type: String,
      default: '',
    },
    agreedPrice: {
      type: Number,
      default: 0,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
)

export default mongoose.model('Booking', bookingSchema)
