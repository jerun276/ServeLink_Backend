import express from 'express'
import {
  createOrGetConversation,
  listMyConversations,
  listConversationMessages,
  sendMessage,
} from '../controllers/chatController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/conversations', protect, createOrGetConversation)
router.get('/conversations', protect, listMyConversations)
router.get('/conversations/:id/messages', protect, listConversationMessages)
router.post('/conversations/:id/messages', protect, sendMessage)

export default router
