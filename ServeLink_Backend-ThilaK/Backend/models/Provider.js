import mongoose from 'mongoose'

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please provide a business name'],
    },
    nicNumber: {
      type: String,
      required: [true, 'Please provide a NIC number'],
    },
    nicImageUrl: {
      type: String,
      required: [true, 'Please provide a NIC image'],
    },
    businessRegUrl: {
      type: String,
      default: '',
    },
    hasBusinessReg: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    serviceCategories: [String],
    district: {
      type: String,
      required: [true, 'Please provide a district'],
    },
    bio: {
      type: String,
      default: '',
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    verifiedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
)

export default mongoose.model('Provider', providerSchema)
