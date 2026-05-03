import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import Provider from '../models/Provider.js'

const VALID_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
]

export const createBooking = async (req, res, next) => {
  try {
    const { serviceId, scheduledAt, address, district, notes } = req.body
    const customerId = req.user.id

    if (!serviceId || !scheduledAt || !address || !district) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    if (!VALID_DISTRICTS.includes(district)) {
      return res.status(400).json({ success: false, message: 'Invalid district' })
    }

    const service = await Service.findById(serviceId)
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    const provider = await Provider.findById(service.providerId)
    if (provider.verificationStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Provider is not approved' })
    }

    const booking = await Booking.create({
      customerId,
      providerId: service.providerId,
      serviceId,
      scheduledAt: new Date(scheduledAt),
      address,
      district,
      notes: notes || '',
      agreedPrice: service.pricingType === 'fixed' ? service.fixedPrice : 0,
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      message: 'Booking created',
      booking,
    })
  } catch (error) {
    next(error)
  }
}

export const getCustomerBookings = async (req, res, next) => {
  try {
    const customerId = req.user.id

    const bookings = await Booking.find({ customerId })
      .populate('serviceId', 'title category')
      .populate('providerId', 'businessName district')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      bookings,
    })
  } catch (error) {
    next(error)
  }
}

export const getProviderBookings = async (req, res, next) => {
  try {
    const userId = req.user.id

    const provider = await Provider.findOne({ userId })
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' })
    }

    const bookings = await Booking.find({ providerId: provider._id })
      .populate('customerId', 'name phone email')
      .populate('serviceId', 'title category')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      bookings,
    })
  } catch (error) {
    next(error)
  }
}

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, agreedPrice } = req.body
    const userId = req.user.id

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (!['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const provider = await Provider.findById(booking.providerId)
    if (provider.userId.toString() !== userId && booking.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' })
    }

    if (status === 'accepted' && agreedPrice) {
      booking.agreedPrice = agreedPrice
    }

    booking.status = status
    await booking.save()

    res.json({
      success: true,
      message: 'Booking status updated',
      booking,
    })
  } catch (error) {
    next(error)
  }
}

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const customerId = req.user.id

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.customerId.toString() !== customerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' })
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending bookings' })
    }

    booking.status = 'cancelled'
    await booking.save()

    res.json({
      success: true,
      message: 'Booking cancelled',
      booking,
    })
  } catch (error) {
    next(error)
  }
}
