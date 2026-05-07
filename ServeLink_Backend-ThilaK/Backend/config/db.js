import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI

    if (typeof mongoUri !== 'string' || mongoUri.trim() === '') {
      throw new Error(
        'MONGO_URI is missing. Add it to Backend/.env (you can copy Backend/.env.example).'
      )
    }

    const conn = await mongoose.connect(mongoUri)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
