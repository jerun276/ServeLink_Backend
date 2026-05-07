import express from 'express'
import {
  createService,
  listServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
} from '../controllers/serviceController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'
import { uploadSingle } from '../utils/uploadMiddleware.js'

const router = express.Router()

router.post('/', protect, requireRole('provider'), uploadSingle('serviceImage'), createService)
router.get('/', listServices)
router.get('/my', protect, requireRole('provider'), getMyServices)
router.get('/:id', getServiceById)
router.put('/:id', protect, requireRole('provider'), uploadSingle('serviceImage'), updateService)
router.delete('/:id', protect, requireRole('provider'), deleteService)

export default router
