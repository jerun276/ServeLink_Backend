import User from '../models/User.js'

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, phone, avatarUrl, bio, location, skills } = req.body
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (name !== undefined) user.name = name
    if (phone !== undefined) user.phone = phone
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl
    if (bio !== undefined) user.bio = bio
    if (location !== undefined) user.location = location
    if (Array.isArray(skills)) user.skills = skills

    await user.save()

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
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
      },
    })
  } catch (error) {
    next(error)
  }
}
