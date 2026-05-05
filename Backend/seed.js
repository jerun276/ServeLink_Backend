import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import User from './models/User.js'
import Provider from './models/Provider.js'
import Service from './models/Service.js'
import Booking from './models/Booking.js'
import bcryptjs from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })
connectDB()

const seedDatabase = async () => {
  try {
    await User.deleteMany({})
    await Provider.deleteMany({})
    await Service.deleteMany({})
    await Booking.deleteMany({})

    const passwordHash = await bcryptjs.hash('Admin@1234', 12)

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@servelink.lk',
      passwordHash,
      phone: '+94701234567',
      role: 'admin',
    })

    const customer1 = await User.create({
      name: 'Ajith Fernando',
      email: 'ajith@example.lk',
      passwordHash: await bcryptjs.hash('Customer@123', 12),
      phone: '+94702345678',
      role: 'customer',
    })

    const customer2 = await User.create({
      name: 'Priya Silva',
      email: 'priya@example.lk',
      passwordHash: await bcryptjs.hash('Customer@123', 12),
      phone: '+94703456789',
      role: 'customer',
    })

    const provider1User = await User.create({
      name: 'Rohit Perera',
      email: 'rohit@example.lk',
      passwordHash: await bcryptjs.hash('Provider@123', 12),
      phone: '+94704567890',
      role: 'provider',
    })

    const provider2User = await User.create({
      name: 'Lalith Wijesinghe',
      email: 'lalith@example.lk',
      passwordHash: await bcryptjs.hash('Provider@123', 12),
      phone: '+94705678901',
      role: 'provider',
    })

    const provider1 = await Provider.create({
      userId: provider1User._id,
      businessName: 'Rohit Plumbing Services',
      nicNumber: '123456789V',
      nicImageUrl: 'https://via.placeholder.com/150',
      businessRegUrl: 'https://via.placeholder.com/150',
      hasBusinessReg: true,
      verificationStatus: 'approved',
      serviceCategories: ['plumbing', 'electrical'],
      district: 'Colombo',
      bio: 'Professional plumber with 10 years experience',
      verifiedAt: new Date(),
    })

    const provider2 = await Provider.create({
      userId: provider2User._id,
      businessName: 'Lalith Electrical Works',
      nicNumber: '987654321V',
      nicImageUrl: 'https://via.placeholder.com/150',
      hasBusinessReg: false,
      verificationStatus: 'approved',
      serviceCategories: ['electrical', 'ac_repair'],
      district: 'Kandy',
      bio: 'Certified electrician',
      verifiedAt: new Date(),
    })

    const service1 = await Service.create({
      providerId: provider1._id,
      title: 'Bathroom Plumbing Repair',
      category: 'plumbing',
      description: 'Fix leaky pipes, install new fixtures',
      pricingType: 'fixed',
      fixedPrice: 2500,
      district: 'Colombo',
      isActive: true,
    })

    const service2 = await Service.create({
      providerId: provider2._id,
      title: 'Electrical Wiring Installation',
      category: 'electrical',
      description: 'Home electrical wiring and installation',
      pricingType: 'quote',
      district: 'Kandy',
      isActive: true,
    })

    const booking1 = await Booking.create({
      customerId: customer1._id,
      providerId: provider1._id,
      serviceId: service1._id,
      status: 'pending',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      address: '123 Main Street, Colombo',
      district: 'Colombo',
      notes: 'Fix the kitchen sink',
      agreedPrice: 2500,
    })

    const booking2 = await Booking.create({
      customerId: customer2._id,
      providerId: provider2._id,
      serviceId: service2._id,
      status: 'pending',
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      address: '456 Oak Avenue, Kandy',
      district: 'Kandy',
      notes: 'Install new wiring for bedroom',
      agreedPrice: 0,
    })

    console.log('✅ Database seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

seedDatabase()
