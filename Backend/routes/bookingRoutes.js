import express from 'express'
import {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, requireRole('customer'), createBooking)
router.get('/mine', protect, requireRole('customer'), getCustomerBookings)
router.get('/provider', protect, requireRole('provider'), getProviderBookings)
router.patch('/:id/status', protect, updateBookingStatus)
router.delete('/:id', protect, requireRole('customer'), cancelBooking)

export default router
