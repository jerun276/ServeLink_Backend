import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import Provider from '../models/Provider.js'

export const submitReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body
    const customerId = req.user.id

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' })
    }

    const booking = await Booking.findById(bookingId)
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
      return res.status(400).json({ success: false, message: 'Booking already reviewed' })
    }

    const review = await Review.create({
      bookingId,
      customerId,
      providerId: booking.providerId,
      rating,
      comment: comment || '',
    })

    booking.isReviewed = true
    await booking.save()

    const allReviews = await Review.find({ providerId: booking.providerId })
    const avgRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0

    await Provider.findByIdAndUpdate(booking.providerId, {
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    })

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

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    if (userId !== req.user.id || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' })
    }

    const booking = await Booking.findById(review.bookingId)
    booking.isReviewed = false
    await booking.save()

    await Review.findByIdAndDelete(id)

    const allReviews = await Review.find({ providerId: review.providerId })
    const avgRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0

    await Provider.findByIdAndUpdate(review.providerId, {
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    })

    res.json({
      success: true,
      message: 'Review deleted',
    })
  } catch (error) {
    next(error)
  }
}
