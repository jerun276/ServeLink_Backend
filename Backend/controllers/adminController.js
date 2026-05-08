import Booking from '../models/Booking.js'
import Provider from '../models/Provider.js'
import Review from '../models/Review.js'
import Service from '../models/Service.js'
import User from '../models/User.js'
import { AppError } from '../middleware/errorHandler.js'

const STATUS_BUCKETS = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected']

const normalizeStatusCounts = (rows) => {
  const counts = STATUS_BUCKETS.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

  rows.forEach((item) => {
    if (STATUS_BUCKETS.includes(item._id)) {
      counts[item._id] = item.count
    }
  })

  return counts
}

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalProvidersUsers,
      totalAdmins,
      totalProviderProfiles,
      approvedProviders,
      pendingProviders,
      rejectedProviders,
      totalServices,
      activeServices,
      totalBookings,
      statusRows,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      User.countDocuments({ role: 'admin' }),
      Provider.countDocuments(),
      Provider.countDocuments({ verificationStatus: 'approved' }),
      Provider.countDocuments({ verificationStatus: 'pending' }),
      Provider.countDocuments({ verificationStatus: 'rejected' }),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Review.countDocuments(),
    ])

    const bookingStatusCounts = normalizeStatusCounts(statusRows)

    const completionRate = totalBookings > 0
      ? Number(((bookingStatusCounts.completed / totalBookings) * 100).toFixed(1))
      : 0

    const recentPendingProviders = await Provider.find({ verificationStatus: 'pending' })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('userId', 'name email phone avatarUrl')

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          customers: totalCustomers,
          providerUsers: totalProvidersUsers,
        },
        providers: {
          profilesTotal: totalProviderProfiles,
          approved: approvedProviders,
          pending: pendingProviders,
          rejected: rejectedProviders,
        },
        services: {
          total: totalServices,
          active: activeServices,
          inactive: Math.max(totalServices - activeServices, 0),
        },
        bookings: {
          total: totalBookings,
          byStatus: bookingStatusCounts,
          completionRate,
        },
        reviews: {
          total: totalReviews,
        },
      },
      pendingProviders: recentPendingProviders,
    })
  } catch (error) {
    next(error)
  }
}

export const getPendingProviderReviews = async (req, res, next) => {
  try {
    const providers = await Provider.find({ verificationStatus: 'pending' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone avatarUrl')

    res.json({
      success: true,
      providers,
    })
  } catch (error) {
    next(error)
  }
}

export const getProviderReviewDetail = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('userId', 'name email phone avatarUrl')
    if (!provider) {
      throw new AppError('Provider not found', 404)
    }

    const services = await Service.find({ providerId: provider._id }).sort({ createdAt: -1 })
    const reviews = await Review.find({ providerId: provider._id })
      .sort({ createdAt: -1 })
      .populate('customerId', 'name')
      .limit(20)

    res.json({
      success: true,
      provider,
      services,
      reviews,
    })
  } catch (error) {
    next(error)
  }
}
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email')
      .populate('providerId', 'businessName')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({
      success: true,
      bookings,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-passwordHash -refreshTokenHash')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({
      success: true,
      users,
    })
  } catch (error) {
    next(error)
  }
}

export const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) throw new AppError('User not found', 404)
    if (user.role === 'admin') throw new AppError('Cannot block another admin', 403)

    user.isBlocked = true
    await user.save()

    res.json({ success: true, message: 'User blocked successfully' })
  } catch (error) {
    next(error)
  }
}

export const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) throw new AppError('User not found', 404)

    user.isBlocked = false
    await user.save()

    res.json({ success: true, message: 'User unblocked successfully' })
  } catch (error) {
    next(error)
  }
}

export const addAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password || !phone) {
      throw new AppError('Please provide all details', 400)
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) throw new AppError('Email already in use', 400)

    const bcryptjs = (await import('bcryptjs')).default
    const passwordHash = await bcryptjs.hash(password, 12)

    await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      phone,
      role: 'admin',
    })

    res.status(201).json({ success: true, message: 'New admin created successfully' })
  } catch (error) {
    next(error)
  }
}
