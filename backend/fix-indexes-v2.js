const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://ssayanmjhi204:sayan@cluster0.cg391uu.mongodb.net/?appName=Cluster0';
    
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

async function fixIndexes() {
  try {
    await connectDB();
    
    // Get the database and collection directly
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    console.log('Current indexes:', await collection.indexes());
    
    // Drop all existing indexes except _id
    const indexes = await collection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        console.log(`Dropping index: ${index.name}`);
        try {
          await collection.dropIndex(index.name);
        } catch (err) {
          console.log(`Could not drop index ${index.name}:`, err.message);
        }
      }
    }
    
    // Create new indexes
    console.log('Creating new indexes...');
    
    // Index for email (always unique)
    await collection.createIndex({ email: 1 }, { unique: true });
    
    // Index for username only when role is user (partial index)
    await collection.createIndex(
      { username: 1 }, 
      { 
        unique: true,
        partialFilterExpression: { role: 'user', username: { $exists: true, $ne: null } }
      }
    );
    
    // Index for companyName only when role is company (partial index)
    await collection.createIndex(
      { companyName: 1 }, 
      { 
        unique: true,
        partialFilterExpression: { role: 'company', companyName: { $exists: true, $ne: null } }
      }
    );
    
    // Index for role for better query performance
    await collection.createIndex({ role: 1 });
    
    console.log('New indexes:', await collection.indexes());
    console.log('✅ Indexes fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

fixIndexes();
