import Provider from '../models/Provider.js'
import User from '../models/User.js'
import Service from '../models/Service.js'
import Review from '../models/Review.js'
import { uploadToCloudinary } from '../utils/uploadMiddleware.js'
import { SRI_LANKAN_DISTRICTS } from '../constants/districts.js'
import { SERVICE_CATEGORIES } from '../constants/categories.js'

export const createProvider = async (req, res, next) => {
  try {
    const { businessName, nicNumber, serviceCategories, district, bio } = req.body
    const userId = req.user.id

    if (!businessName || !nicNumber || !district) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    if (!SRI_LANKAN_DISTRICTS.includes(district)) {
      return res.status(400).json({ success: false, message: 'Invalid district' })
    }

    if (serviceCategories && Array.isArray(serviceCategories)) {
      const invalid = serviceCategories.filter(cat => !SERVICE_CATEGORIES.includes(cat))
      if (invalid.length > 0) {
        return res.status(400).json({ success: false, message: `Invalid categories: ${invalid.join(', ')}` })
      }
    }

    const existingProvider = await Provider.findOne({ userId })
    if (existingProvider) {
      return res.status(400).json({ success: false, message: 'Provider profile already exists' })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'NIC image is required' })
    }

    const nicImageUrl = await uploadToCloudinary(req.file, 'servelink/nics')

    const provider = await Provider.create({
      userId,
      businessName,
      nicNumber,
      nicImageUrl,
      serviceCategories: serviceCategories || [],
      district,
      bio: bio || '',
    })

    const response = {
      success: true,
      message: 'Provider profile created. Awaiting verification.',
      provider,
      tip: provider.hasBusinessReg ? undefined : 'Upload your business registration to earn a Verified Business badge',
    }

    res.status(201).json(response)
  } catch (error) {
    next(error)
  }
}

export const listApprovedProviders = async (req, res, next) => {
  try {
    const { district, category } = req.query
    const query = { verificationStatus: 'approved' }

    if (district && SRI_LANKAN_DISTRICTS.includes(district)) {
      query.district = district
    }
    if (category) {
      query.serviceCategories = category
    }

    const providers = await Provider.find(query)
      .populate('userId', 'name email avatarUrl')
      .select('-rejectionReason')

    const enriched = providers.map(p => ({
      ...p.toObject(),
      badges: ['Verified Identity'].concat(p.hasBusinessReg ? ['Verified Business'] : []),
    }))

    res.json({
      success: true,
      providers: enriched,
    })
  } catch (error) {
    next(error)
  }
}

export const getPendingProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({ verificationStatus: 'pending' })
      .populate('userId', 'name email phone')

    res.json({
      success: true,
      providers,
    })
  } catch (error) {
    next(error)
  }
}

export const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params

    const provider = await Provider.findById(id)
      .populate('userId', 'name email phone avatarUrl')

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' })
    }

    const services = await Service.find({ providerId: id, isActive: true })
    const reviews = await Review.find({ providerId: id })
      .populate('customerId', 'name')

    const result = {
      ...provider.toObject(),
      badges: ['Verified Identity'].concat(provider.hasBusinessReg ? ['Verified Business'] : []),
      services,
      reviews,
    }

    res.json({
      success: true,
      provider: result,
    })
  } catch (error) {
    next(error)
  }
}

export const updateProvider = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const provider = await Provider.findById(id)
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' })
    }

    if (provider.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this provider' })
    }

    const { businessName, serviceCategories, district, bio } = req.body

    if (district && !SRI_LANKAN_DISTRICTS.includes(district)) {
      return res.status(400).json({ success: false, message: 'Invalid district' })
    }

    if (businessName) provider.businessName = businessName
    if (serviceCategories) provider.serviceCategories = serviceCategories
    if (district) provider.district = district
    if (bio) provider.bio = bio

    if (req.file) {
      const businessRegUrl = await uploadToCloudinary(req.file, 'servelink/business-regs')
      provider.businessRegUrl = businessRegUrl
      provider.hasBusinessReg = true
    }

    await provider.save()

    res.json({
      success: true,
      message: 'Provider profile updated',
      provider,
    })
  } catch (error) {
    next(error)
  }
}

export const verifyProvider = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, action, reason } = req.body

    const normalizedAction = action ? String(action).toLowerCase() : null
    const normalizedStatus = status ? String(status).toLowerCase() : null
    const decision =
      normalizedStatus && ['approved', 'rejected'].includes(normalizedStatus)
        ? normalizedStatus
        : normalizedAction === 'approve'
          ? 'approved'
          : normalizedAction === 'reject'
            ? 'rejected'
            : null

    if (!decision) {
      return res.status(400).json({ success: false, message: 'Invalid verification action' })
    }

    if (decision === 'rejected' && (!reason || !String(reason).trim())) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' })
    }

    const provider = await Provider.findByIdAndUpdate(
      id,
      {
        verificationStatus: decision,
        rejectionReason: decision === 'rejected' ? String(reason).trim() : '',
        verifiedAt: decision === 'approved' ? new Date() : undefined,
      },
      { new: true }
    )

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' })
    }

    res.json({
      success: true,
      message: `Provider ${decision}`,
      provider,
    })
  } catch (error) {
    next(error)
  }
}
