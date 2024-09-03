import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', false);

  try {
    await mongoose.connect(process.env.DATABASE_URI!);
    console.log('Database Connected Sucessfully');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Optionally exit the process if connection fails
  }
};

export default connectDB;
