import bcryptjs from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { AppError } from '../middleware/errorHandler.js'

const PASSWORD_SALT_ROUNDS = 12

const getAccessSecret = () => process.env.JWT_SECRET
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
const getAccessExpiry = () => process.env.JWT_EXPIRES_IN || '15m'
const getRefreshExpiry = () => process.env.JWT_REFRESH_EXPIRES_IN || '7d'

const ensureJwtConfig = () => {
  if (!getAccessSecret()) {
    throw new AppError('Missing JWT_SECRET configuration', 500)
  }
}

const normalizeEmail = (email) => email.trim().toLowerCase()

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  location: user.location,
  skills: user.skills,
  completedJobs: user.completedJobs,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const signAccessToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role, type: 'access' }, getAccessSecret(), {
    expiresIn: getAccessExpiry(),
  })

const signRefreshToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      type: 'refresh',
      jti: crypto.randomUUID(),
    },
    getRefreshSecret(),
    { expiresIn: getRefreshExpiry() }
  )

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

const persistRefreshToken = async (user, refreshToken) => {
  const decoded = jwt.verify(refreshToken, getRefreshSecret())

  user.refreshTokenHash = hashToken(refreshToken)
  user.refreshTokenExpiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null
  await user.save()
}

const createAuthPayload = async (user) => {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)

  await persistRefreshToken(user, refreshToken)

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  }
}

export const register = async (req, res, next) => {
  try {
    ensureJwtConfig()

    const { name, email, password, phone, role } = req.body
    if (!name || !email || !password || !phone) {
      throw new AppError('Please provide name, email, password and phone', 400)
    }

    if (typeof password !== 'string' || password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400)
    }

    const normalizedEmail = normalizeEmail(email)
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      throw new AppError('Email already in use', 409)
    }

    const requestedRole = role || 'customer'
    if (!['customer', 'provider'].includes(requestedRole)) {
      throw new AppError('Invalid registration role', 400)
    }

    const passwordHash = await bcryptjs.hash(password, PASSWORD_SALT_ROUNDS)
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      phone,
      role: requestedRole,
    })

    const auth = await createAuthPayload(user)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      ...auth,
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    ensureJwtConfig()

    const { email, password } = req.body
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400)
    }

    const normalizedEmail = normalizeEmail(email)
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +refreshTokenHash +refreshTokenExpiresAt')
    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401)
    }

    const auth = await createAuthPayload(user)
    res.json({
      success: true,
      message: 'Login successful',
      ...auth,
    })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (req, res, next) => {
  try {
    ensureJwtConfig()

    const providedToken = req.body?.refreshToken
    if (!providedToken) {
      throw new AppError('Refresh token is required', 400)
    }

    let decoded
    try {
      decoded = jwt.verify(providedToken, getRefreshSecret())
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401)
    }

    if (decoded.type !== 'refresh' || !decoded.id) {
      throw new AppError('Invalid refresh token payload', 401)
    }

    const user = await User.findById(decoded.id).select('+refreshTokenHash +refreshTokenExpiresAt')
    if (!user || !user.refreshTokenHash) {
      throw new AppError('Refresh token not recognized', 401)
    }

    const matchesStoredToken = hashToken(providedToken) === user.refreshTokenHash
    const isStoredTokenExpired = user.refreshTokenExpiresAt && user.refreshTokenExpiresAt.getTime() < Date.now()

    if (!matchesStoredToken || isStoredTokenExpired) {
      throw new AppError('Refresh token has expired or was revoked', 401)
    }

    const auth = await createAuthPayload(user)
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      ...auth,
    })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.json({
      success: true,
      user: toPublicUser(user),
    })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+refreshTokenHash +refreshTokenExpiresAt')
    if (!user) {
      throw new AppError('User not found', 404)
    }

    user.refreshTokenHash = null
    user.refreshTokenExpiresAt = null
    await user.save()

    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      throw new AppError('currentPassword and newPassword are required', 400)
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters', 400)
    }

    const user = await User.findById(req.user.id).select('+passwordHash +refreshTokenHash +refreshTokenExpiresAt')
    if (!user) {
      throw new AppError('User not found', 404)
    }

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.passwordHash)
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 401)
    }

    user.passwordHash = await bcryptjs.hash(newPassword, PASSWORD_SALT_ROUNDS)
    user.refreshTokenHash = null
    user.refreshTokenExpiresAt = null
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    })
  } catch (error) {
    next(error)
  }
}
