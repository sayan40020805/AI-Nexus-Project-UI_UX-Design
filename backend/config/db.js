const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://ainexus_user:AINexus2024@ac-nxn5qqk-shard-00-00.cg391uu.mongodb.net/AI_Nexus?retryWrites=true&w=majority';
    
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('Continuing without database connection...');
    // Don't exit - continue without database for testing
  }
};

module.exports = connectDB;
