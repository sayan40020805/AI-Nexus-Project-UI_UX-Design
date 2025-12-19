


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
    
    // Get the User collection
    const User = mongoose.model('User');
    const collection = User.collection;
    
    console.log('Current indexes:', await collection.indexes());
    
    // Drop all existing indexes except _id
    const indexes = await collection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        console.log(`Dropping index: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }
    
    // Create new indexes
    console.log('Creating new indexes...');
    
    // Index for email (always unique)
    await collection.createIndex({ email: 1 }, { unique: true });
    
    // Index for username only when role is user (compound index)
    await collection.createIndex(
      { role: 1, username: 1 }, 
      { 
        unique: true,
        partialFilterExpression: { role: 'user', username: { $exists: true, $ne: null } }
      }
    );
    
    // Index for companyName only when role is company
    await collection.createIndex(
      { role: 1, companyName: 1 }, 
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
