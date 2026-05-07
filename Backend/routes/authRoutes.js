import express from 'express'
import {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  changePassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshToken)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)
router.post('/change-password', protect, changePassword)

export default router
