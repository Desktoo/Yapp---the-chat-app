import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const DB = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected: ${DB.connection.host}`)
    } catch (error) {
        console.log('MongoDB connection error: ', error)
    }
}