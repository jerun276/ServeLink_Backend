import express from 'express'
import {
  submitReview,
  getProviderReviews,
  getServiceReviews,
  deleteReview,
} from '../controllers/reviewController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, requireRole('customer'), submitReview)
router.get('/provider/:id', getProviderReviews)
router.get('/service/:id', getServiceReviews)
router.delete('/:id', protect, requireRole('admin'), deleteReview)

export default router
