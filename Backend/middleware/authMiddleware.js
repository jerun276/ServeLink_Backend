import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { AppError } from './errorHandler.js'

const getAccessSecret = () => process.env.JWT_SECRET

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null
  }

  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

export const protect = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization)
    if (!token) {
      throw new AppError('Authentication required', 401)
    }

    if (!getAccessSecret()) {
      throw new AppError('Missing JWT_SECRET configuration', 500)
    }

    let decoded
    try {
      decoded = jwt.verify(token, getAccessSecret())
    } catch (error) {
      throw new AppError('Invalid or expired access token', 401)
    }

    if (!decoded?.id || decoded.type !== 'access') {
      throw new AppError('Invalid access token payload', 401)
    }

    const user = await User.findById(decoded.id).select('id role email')
    if (!user) {
      throw new AppError('User not found for this token', 401)
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not allowed to access this resource', 403))
    }

    next()
  }
}
