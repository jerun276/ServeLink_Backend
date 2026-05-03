import express from 'express'
import {
  submitReview,
  getProviderReviews,
  deleteReview,
} from '../controllers/reviewController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, requireRole('customer'), submitReview)
router.get('/provider/:id', getProviderReviews)
router.delete('/:id', protect, requireRole('admin'), deleteReview)

export default router
