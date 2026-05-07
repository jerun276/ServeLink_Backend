import Booking from '../models/Booking.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import Provider from '../models/Provider.js'

const ensureBookingParticipant = async (booking, userId, role) => {
  if (!booking) return false
  if (booking.customerId.toString() === userId) return true
  if (role === 'provider') {
    const provider = await Provider.findOne({ userId })
    return provider ? provider._id.toString() === booking.providerId.toString() : false
  }
  return false
}

export const createOrGetConversation = async (req, res, next) => {
  try {
    const { bookingId } = req.body
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' })
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    const allowed = await ensureBookingParticipant(booking, req.user.id, req.user.role)
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking chat' })
    }

    let conversation = await Conversation.findOne({ bookingId })
    if (!conversation) {
      conversation = await Conversation.create({
        bookingId,
        customerId: booking.customerId,
        providerId: booking.providerId,
      })
    }

    res.json({ success: true, conversation })
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
    const conversation = await Conversation.findById(id)
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' })
    }

    const booking = await Booking.findById(conversation.bookingId)
    const allowed = await ensureBookingParticipant(booking, req.user.id, req.user.role)
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

    const booking = await Booking.findById(conversation.bookingId)
    const allowed = await ensureBookingParticipant(booking, req.user.id, req.user.role)
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
