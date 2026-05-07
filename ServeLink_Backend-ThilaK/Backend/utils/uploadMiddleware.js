import multer from 'multer'
import cloudinary from '../config/cloudinary.js'

const storage = multer.memoryStorage()

// File size limit: 5MB per file
const MAX_FILE_SIZE = 5 * 1024 * 1024

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, and GIF images are allowed'))
  }
}

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
})

export const uploadSingle = (fieldName) => {
  return upload.single(fieldName)
}

export const uploadFields = (fields) => {
  return upload.fields(fields)
}

// Upload to Cloudinary with error handling and retry logic
export const uploadToCloudinary = (file, folder, retries = 3) => {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder, 
          resource_type: 'auto',
          timeout: 60000 // 60 second timeout
        },
        (error, result) => {
          if (error) {
            console.error(`[Cloudinary] Upload failed (${folder}): ${error.message}`)
            
            if (retriesLeft > 0 && error.http_code >= 500) {
              console.log(`[Cloudinary] Retrying... (${retriesLeft} attempts left)`)
              setTimeout(() => attempt(retriesLeft - 1), 1000)
            } else {
              reject(new Error(`Image upload failed: ${error.message}`))
            }
          } else {
            console.log(`[Cloudinary] Upload successful: ${result.public_id}`)
            resolve(result.secure_url)
          }
        }
      )
      
      stream.on('error', (error) => {
        console.error(`[Cloudinary] Stream error: ${error.message}`)
        if (retriesLeft > 0) {
          console.log(`[Cloudinary] Retrying after stream error... (${retriesLeft} attempts left)`)
          setTimeout(() => attempt(retriesLeft - 1), 1000)
        } else {
          reject(new Error(`Image upload failed: ${error.message}`))
        }
      })
      
      stream.end(file.buffer)
    }
    
    attempt(retries)
  })
}

// Validate file before upload
export const validateImageFile = (file) => {
  if (!file) {
    throw new Error('No file provided')
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
  }
  
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed')
  }
  
  return true
}
