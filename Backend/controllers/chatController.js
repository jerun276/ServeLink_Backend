import Booking from '../models/Booking.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import Provider from '../models/Provider.js'

const ensureParticipant = async (conversation, userId, role) => {
  if (!conversation) return false
  
  if (conversation.customerId && conversation.customerId.toString() === userId) return true
  
  if (role === 'provider') {
    const provider = await Provider.findOne({ userId })
    return provider ? provider._id.toString() === conversation.providerId.toString() : false
  }
  
  return false
}

export const createOrGetConversation = async (req, res, next) => {
  try {
    const { bookingId, providerId } = req.body
    
    if (bookingId && bookingId.length > 5) {
      const booking = await Booking.findById(bookingId)
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' })
      }

      let conversation = await Conversation.findOne({ bookingId })
      if (!conversation) {
        conversation = await Conversation.create({
          bookingId,
          customerId: booking.customerId,
          providerId: booking.providerId,
        })
      }
      return res.json({ success: true, conversation })
    }

    if (providerId) {
      if (req.user.role !== 'customer') {
        return res.status(403).json({ success: false, message: 'Only customers can initiate new chats with providers' })
      }

      // If it's a mock ID (starts with usr-), we can't save it to DB as ObjectId
      // For development, we'll return a "demo" conversation ID or just allow it if we change the model
      // But let's assume we want real DB records.
      
      let conversation = await Conversation.findOne({ 
        providerId: providerId.length === 24 ? providerId : null, 
        customerId: req.user.id,
        bookingId: { $exists: false }
      })

      if (!conversation) {
        // If providerId is not a valid ObjectId, we use a fallback or return error
        if (providerId.length !== 24 && !providerId.startsWith('usr-')) {
           return res.status(400).json({ success: false, message: 'Invalid provider ID' })
        }

        // For now, let's try to create it. If it fails due to cast, we catch it.
        try {
          conversation = await Conversation.create({
            providerId: providerId.length === 24 ? providerId : undefined, // This will fail if required
            customerId: req.user.id,
          })
        } catch (e) {
          return res.status(400).json({ success: false, message: 'Pre-booking chat requires a valid provider profile' })
        }
      }
      return res.json({ success: true, conversation })
    }

    res.status(400).json({ success: false, message: 'Chat system ready: Select a provider or booking to message.' })
  } catch (error) {
    next(error)
  }
}

export const listMyConversations = async (req, res, next) => {
  try {
    const userId = req.user.id
    let conversations = []

    if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ userId })
      if (!provider) {
        return res.json({ success: true, conversations: [] })
      }
      conversations = await Conversation.find({ providerId: provider._id })
        .populate('customerId', 'name avatarUrl')
        .populate('bookingId', 'status scheduledAt')
        .sort({ lastMessageAt: -1 })
    } else {
      conversations = await Conversation.find({ customerId: userId })
        .populate({
          path: 'providerId',
          populate: { path: 'userId', select: 'name avatarUrl' },
        })
        .populate('bookingId', 'status scheduledAt')
        .sort({ lastMessageAt: -1 })
    }

    res.json({ success: true, conversations })
  } catch (error) {
    next(error)
  }
}

export const listConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id || id === 'undefined' || id === 'null') {
      return res.json({ success: true, messages: [] })
    }

    const conversation = await Conversation.findById(id)
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' })
    }

    const allowed = await ensureParticipant(conversation, req.user.id, req.user.role)
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized for this conversation' })
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name role avatarUrl')

    res.json({ success: true, messages })
  } catch (error) {
    next(error)
  }
}

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params
    const { text } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' })
    }

    const conversation = await Conversation.findById(id)
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' })
    }

    const allowed = await ensureParticipant(conversation, req.user.id, req.user.role)
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized for this conversation' })
    }

    const message = await Message.create({
      conversationId: id,
      senderId: req.user.id,
      text: text.trim(),
    })

    conversation.lastMessageAt = new Date()
    await conversation.save()

    res.status(201).json({ success: true, message })
  } catch (error) {
    next(error)
  }
}
