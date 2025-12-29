#!/usr/bin/env node

/**
 * Post Deletion Test Script
 * 
 * This script helps debug the post deletion functionality by testing:
 * 1. Database connection
 * 2. Post existence
 * 3. Authentication token validation
 * 4. Delete operation
 * 
 * Usage: node test-post-deletion.js <postId> <authToken>
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('./models/Post');
const User = require('./models/User');
require('dotenv').config();

// MongoDB connection
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_nexus';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

// Test JWT token validation
function validateToken(token) {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token validation successful');
    console.log('📋 Decoded token:', {
      id: decoded.id,
      userId: decoded.user?.id,
      role: decoded.user?.role
    });
    return decoded;
  } catch (err) {
    console.error('❌ Token validation failed:', err.message);
    return null;
  }
}

// Test post existence and authorization
async function testPostAccess(postId, userId) {
  try {
    const post = await Post.findById(postId).populate('author', '_id role username companyName');
    
    if (!post) {
      console.log('❌ Post not found:', postId);
      return null;
    }
    
    console.log('✅ Post found:', {
      postId: post._id,
      authorId: post.author._id,
      authorRole: post.author.role,
      authorName: post.author.username || post.author.companyName,
      postType: post.postType,
      createdAt: post.createdAt
    });
    
    // Check authorization
    const isAuthor = post.author._id.toString() === userId;
    const isAdmin = post.author.role === 'admin'; // Assuming we can check this
    
    console.log('🔐 Authorization check:', {
      isAuthor,
      isAdmin,
      userId,
      postAuthorId: post.author._id
    });
    
    return { post, isAuthor, isAdmin };
  } catch (err) {
    console.error('❌ Error accessing post:', err);
    return null;
  }
}

// Test delete operation
async function testDelete(postId) {
  try {
    const result = await Post.findByIdAndDelete(postId);
    
    if (result) {
      console.log('✅ Post deleted successfully:', postId);
      return true;
    } else {
      console.log('❌ Delete operation failed - no document returned');
      return false;
    }
  } catch (err) {
    console.error('❌ Delete operation error:', err);
    return false;
  }
}

// Main test function
async function runTest(postId, authToken) {
  console.log('🧪 Starting Post Deletion Test');
  console.log('================================');
  
  try {
    // Step 1: Connect to database
    await connectDB();
    
    // Step 2: Validate token
    if (!authToken) {
      console.log('❌ No auth token provided');
      return;
    }
    
    const decoded = validateToken(authToken);
    if (!decoded) {
      console.log('❌ Invalid auth token');
      return;
    }
    
    const userId = decoded.user?.id || decoded.id || decoded.userId;
    if (!userId) {
      console.log('❌ No user ID in token');
      return;
    }
    
    // Step 3: Test post access
    const postAccess = await testPostAccess(postId, userId);
    if (!postAccess) {
      console.log('❌ Cannot access post');
      return;
    }
    
    // Step 4: Test delete operation
    console.log('\n🗑️ Testing delete operation...');
    const deleteSuccess = await testDelete(postId);
    
    if (deleteSuccess) {
      console.log('\n✅ ALL TESTS PASSED');
      console.log('Post deletion should work correctly in the application.');
    } else {
      console.log('\n❌ DELETE TEST FAILED');
      console.log('There may be an issue with the delete operation.');
    }
    
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Check command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node test-post-deletion.js <postId> <authToken>');
    console.log('\nExample:');
    console.log('node test-post-deletion.js 507f1f77bcf86cd799439011 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    process.exit(1);
  }
  
  const [postId, authToken] = args;
  runTest(postId, authToken);
}

module.exports = { runTest, validateToken, testPostAccess, testDelete };
