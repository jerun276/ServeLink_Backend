import express from 'express'
import {
  getAdminDashboard,
  getPendingProviderReviews,
  getProviderReviewDetail,
} from '../controllers/adminController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, requireRole('admin'))

router.get('/dashboard', getAdminDashboard)
router.get('/providers/pending', getPendingProviderReviews)
router.get('/providers/:id', getProviderReviewDetail)

export default router
