import express from 'express'
import {
  getAdminDashboard,
  getPendingProviderReviews,
  getProviderReviewDetail,
  getAllBookings,
  getAllUsers,
  blockUser,
  unblockUser,
  addAdmin,
} from '../controllers/adminController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, requireRole('admin'))

router.get('/dashboard', getAdminDashboard)
router.get('/providers/pending', getPendingProviderReviews)
router.get('/providers/:id', getProviderReviewDetail)
router.get('/bookings', getAllBookings)
router.get('/users', getAllUsers)
router.post('/users/:id/block', blockUser)
router.post('/users/:id/unblock', unblockUser)
router.post('/add-admin', addAdmin)

export default router
