import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import Provider from '../models/Provider.js'
import Service from '../models/Service.js'

const refreshRatings = async (serviceId, providerId) => {
  const serviceReviews = await Review.find({ serviceId })
  const serviceAvg =
    serviceReviews.length > 0
      ? serviceReviews.reduce((sum, item) => sum + item.rating, 0) / serviceReviews.length
      : 0

  await Service.findByIdAndUpdate(serviceId, {
    avgRating: Math.round(serviceAvg * 10) / 10,
    totalReviews: serviceReviews.length,
  })

  const providerReviews = await Review.find({ providerId })
  const providerAvg =
    providerReviews.length > 0
      ? providerReviews.reduce((sum, item) => sum + item.rating, 0) / providerReviews.length
      : 0

  await Provider.findByIdAndUpdate(providerId, {
    avgRating: Math.round(providerAvg * 10) / 10,
    totalReviews: providerReviews.length,
  })
}

export const submitReview = async (req, res, next) => {
  try {
    const { bookingId, serviceId: serviceIdInput, rating, comment } = req.body
    const customerId = req.user.id

    if (!serviceIdInput && !bookingId) {
      return res.status(400).json({ success: false, message: 'serviceId or bookingId is required' })
    }

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' })
    }

    let serviceId = serviceIdInput
    let booking = null
    if (bookingId) {
      booking = await Booking.findById(bookingId)
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' })
      }
      if (booking.customerId.toString() !== customerId) {
        return res.status(403).json({ success: false, message: 'Not authorized to review this booking' })
      }
      if (booking.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'Can only review completed bookings' })
      }
      if (booking.isReviewed) {
        return res.status(400).json({ success: false, message: 'This booking has already been reviewed' })
      }
      if (!serviceId) serviceId = booking.serviceId
    }

    const service = await Service.findById(serviceId)
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    const existingReview = await Review.findOne({ customerId, serviceId })
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You already reviewed this service' })
    }

    const review = await Review.create({
      bookingId,
      customerId,
      serviceId,
      providerId: service.providerId,
      rating,
      comment: comment || '',
    })

    if (booking) {
      booking.isReviewed = true
      await booking.save()
    }

    await refreshRatings(service._id, service.providerId)

    res.status(201).json({
      success: true,
      message: 'Review submitted',
      review,
    })
  } catch (error) {
    next(error)
  }
}

export const getProviderReviews = async (req, res, next) => {
  try {
    const { id } = req.params

    const reviews = await Review.find({ providerId: id })
      .populate('customerId', 'name avatarUrl')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      reviews,
    })
  } catch (error) {
    next(error)
  }
}

export const getServiceReviews = async (req, res, next) => {
  try {
    const { id } = req.params

    const reviews = await Review.find({ serviceId: id })
      .populate('customerId', 'name avatarUrl')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      reviews,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    if (review.customerId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' })
    }

    if (review.bookingId) {
      const booking = await Booking.findById(review.bookingId)
      if (booking) {
        booking.isReviewed = false
        await booking.save()
      }
    }

    await Review.findByIdAndDelete(id)

    await refreshRatings(review.serviceId, review.providerId)

    res.json({
      success: true,
      message: 'Review deleted',
    })
  } catch (error) {
    next(error)
  }
}
