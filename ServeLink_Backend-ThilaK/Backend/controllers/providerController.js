import Provider from '../models/Provider.js'
import User from '../models/User.js'
import Service from '../models/Service.js'
import Review from '../models/Review.js'
import { uploadToCloudinary, validateImageFile } from '../utils/uploadMiddleware.js'

const VALID_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
]

// Sri Lankan NIC format validation: 9 digits + V (e.g., 123456789V)
const validateNICFormat = (nicNumber) => {
  const nicRegex = /^\d{9}[Vv]$/
  return nicRegex.test(nicNumber)
}

export const createProvider = async (req, res, next) => {
  try {
    const { businessName, nicNumber, serviceCategories, district, bio } = req.body
    const userId = req.user.id

    // Validate required fields
    if (!businessName || !businessName.trim()) {
      return res.status(400).json({ success: false, message: 'Business name is required' })
    }
    if (!nicNumber || !nicNumber.trim()) {
      return res.status(400).json({ success: false, message: 'NIC number is required' })
    }
    if (!district) {
      return res.status(400).json({ success: false, message: 'District is required' })
    }

    // Validate NIC format
    if (!validateNICFormat(nicNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid NIC format. Expected format: 123456789V' })
    }

    // Validate district
    if (!VALID_DISTRICTS.includes(district)) {
      return res.status(400).json({ success: false, message: 'Invalid district. Please select a valid Sri Lankan district' })
    }

    // Check if provider profile already exists
    const existingProvider = await Provider.findOne({ userId })
    if (existingProvider) {
      return res.status(400).json({ success: false, message: 'Provider profile already exists for this user' })
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'NIC image is required for verification' })
    }

    try {
      validateImageFile(req.file)
    } catch (validationError) {
      return res.status(400).json({ success: false, message: validationError.message })
    }

    // Upload NIC image to Cloudinary
    let nicImageUrl
    try {
      nicImageUrl = await uploadToCloudinary(req.file, 'servelink/nics')
    } catch (uploadError) {
      console.error('NIC upload error:', uploadError.message)
      return res.status(500).json({ success: false, message: uploadError.message })
    }

    const provider = await Provider.create({
      userId,
      businessName: businessName.trim(),
      nicNumber: nicNumber.trim().toUpperCase(),
      nicImageUrl,
      serviceCategories: serviceCategories || [],
      district,
      bio: bio ? bio.trim() : '',
    })

    const response = {
      success: true,
      message: 'Provider profile created successfully. Awaiting admin verification.',
      provider,
      tip: 'Upload your business registration to earn a Verified Business badge and build customer trust',
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

    if (district && VALID_DISTRICTS.includes(district)) {
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

    // Verify authorization: only the provider owner can update
    if (provider.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this provider profile' })
    }

    const { businessName, serviceCategories, district, bio } = req.body

    // Validate and update fields
    if (businessName && businessName.trim()) {
      provider.businessName = businessName.trim()
    }
    
    if (serviceCategories && Array.isArray(serviceCategories)) {
      provider.serviceCategories = serviceCategories
    }
    
    if (district) {
      if (!VALID_DISTRICTS.includes(district)) {
        return res.status(400).json({ success: false, message: 'Invalid district. Please select a valid Sri Lankan district' })
      }
      provider.district = district
    }
    
    if (bio !== undefined) {
      provider.bio = bio ? bio.trim() : ''
    }

    // Handle business registration file upload
    if (req.file) {
      try {
        validateImageFile(req.file)
      } catch (validationError) {
        return res.status(400).json({ success: false, message: validationError.message })
      }

      try {
        const businessRegUrl = await uploadToCloudinary(req.file, 'servelink/business-regs')
        provider.businessRegUrl = businessRegUrl
        provider.hasBusinessReg = true
      } catch (uploadError) {
        console.error('Business registration upload error:', uploadError.message)
        return res.status(500).json({ success: false, message: uploadError.message })
      }
    }

    await provider.save()

    res.json({
      success: true,
      message: 'Provider profile updated successfully',
      provider,
      tip: provider.hasBusinessReg ? 'Your verified business badge will be displayed once admin approves your documents' : undefined,
    })
  } catch (error) {
    next(error)
  }
}

export const verifyProvider = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be either "approved" or "rejected"' })
    }

    // Validate rejection reason is provided if rejecting
    if (status === 'rejected' && (!reason || !reason.trim())) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting a provider' })
    }

    const provider = await Provider.findByIdAndUpdate(
      id,
      {
        verificationStatus: status,
        rejectionReason: status === 'rejected' ? reason.trim() : '',
        verifiedAt: status === 'approved' ? new Date() : undefined,
      },
      { new: true }
    )

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' })
    }

    // Populate user data for response
    await provider.populate('userId', 'name email')

    res.json({
      success: true,
      message: `Provider profile successfully ${status}`,
      provider,
      action: status === 'approved' 
        ? 'Provider can now create services and accept bookings' 
        : 'Provider has been notified and can reapply after fixing issues',
    })
  } catch (error) {
    next(error)
  }
}
