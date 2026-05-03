import Service from '../models/Service.js'
import Provider from '../models/Provider.js'
import { uploadToCloudinary } from '../utils/uploadMiddleware.js'

const VALID_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
]

export const createService = async (req, res, next) => {
  try {
    const { title, category, description, pricingType, fixedPrice, district } = req.body
    const userId = req.user.id

    if (!title || !category || !description || !pricingType || !district) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    if (!VALID_DISTRICTS.includes(district)) {
      return res.status(400).json({ success: false, message: 'Invalid district' })
    }

    if (pricingType === 'fixed' && !fixedPrice) {
      return res.status(400).json({ success: false, message: 'Fixed price required for fixed pricing type' })
    }

    const provider = await Provider.findOne({ userId })
    if (!provider || provider.verificationStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Only approved providers can create services' })
    }

    let imageUrl = ''
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file, 'servelink/services')
    }

    const service = await Service.create({
      providerId: provider._id,
      title,
      category,
      description,
      imageUrl,
      pricingType,
      fixedPrice: pricingType === 'fixed' ? fixedPrice : 0,
      district,
    })

    res.status(201).json({
      success: true,
      message: 'Service created',
      service,
    })
  } catch (error) {
    next(error)
  }
}

export const listServices = async (req, res, next) => {
  try {
    const { category, district, pricingType } = req.query
    const query = { isActive: true }

    if (category) {
      query.category = category
    }
    if (district && VALID_DISTRICTS.includes(district)) {
      query.district = district
    }
    if (pricingType && ['fixed', 'quote'].includes(pricingType)) {
      query.pricingType = pricingType
    }

    const services = await Service.find(query)
      .populate({
        path: 'providerId',
        select: 'businessName avgRating totalReviews district',
        match: { verificationStatus: 'approved' },
      })
      .lean()

    const filtered = services.filter(s => s.providerId !== null)

    res.json({
      success: true,
      services: filtered,
    })
  } catch (error) {
    next(error)
  }
}

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params

    const service = await Service.findById(id)
      .populate({
        path: 'providerId',
        select: 'businessName avgRating totalReviews district bio',
      })

    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    res.json({
      success: true,
      service,
    })
  } catch (error) {
    next(error)
  }
}

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { title, category, description, pricingType, fixedPrice, district } = req.body

    const service = await Service.findById(id)
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    const provider = await Provider.findById(service.providerId)
    if (provider.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service' })
    }

    if (district && !VALID_DISTRICTS.includes(district)) {
      return res.status(400).json({ success: false, message: 'Invalid district' })
    }

    if (title) service.title = title
    if (category) service.category = category
    if (description) service.description = description
    if (pricingType) service.pricingType = pricingType
    if (pricingType === 'fixed' && fixedPrice) service.fixedPrice = fixedPrice
    if (district) service.district = district

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file, 'servelink/services')
      service.imageUrl = imageUrl
    }

    await service.save()

    res.json({
      success: true,
      message: 'Service updated',
      service,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const service = await Service.findById(id)
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    const provider = await Provider.findById(service.providerId)
    if (provider.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this service' })
    }

    await Service.findByIdAndDelete(id)

    res.json({
      success: true,
      message: 'Service deleted',
    })
  } catch (error) {
    next(error)
  }
}

export const getMyServices = async (req, res, next) => {
  try {
    const userId = req.user.id

    const provider = await Provider.findOne({ userId })
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' })
    }

    const services = await Service.find({ providerId: provider._id })

    res.json({
      success: true,
      services,
    })
  } catch (error) {
    next(error)
  }
}
