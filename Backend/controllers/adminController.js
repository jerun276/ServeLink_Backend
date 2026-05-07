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
