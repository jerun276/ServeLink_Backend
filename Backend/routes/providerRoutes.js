import express from 'express'
import {
  createProvider,
  listApprovedProviders,
  getPendingProviders,
  getProviderById,
  updateProvider,
  verifyProvider,
} from '../controllers/providerController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'
import { uploadSingle } from '../utils/uploadMiddleware.js'

const router = express.Router()

router.post('/', protect, uploadSingle('nicImage'), createProvider)
router.get('/', listApprovedProviders)
router.get('/pending', protect, requireRole('admin'), getPendingProviders)
router.get('/:id', getProviderById)
router.put('/:id', protect, uploadSingle('businessRegImage'), updateProvider)
router.patch('/:id/verify', protect, requireRole('admin'), verifyProvider)

export default router
