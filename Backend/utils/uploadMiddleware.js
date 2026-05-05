import multer from 'multer'
import cloudinary from '../config/cloudinary.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'))
  }
}

const upload = multer({ storage, fileFilter })

export const uploadSingle = (fieldName) => {
  return upload.single(fieldName)
}

export const uploadFields = (fields) => {
  return upload.fields(fields)
}

export const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    )
    stream.end(file.buffer)
  })
}
