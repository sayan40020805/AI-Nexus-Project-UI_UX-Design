
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
require('dotenv').config();

async function fixUserPosts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_nexus');
    console.log('✅ Connected to MongoDB');
    
    // Find the user by email
    const user = await User.findOne({ email: 'biswanath@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found with email: biswanath@gmail.com');
      const allUsers = await User.find().select('email username');
      console.log('Available users:', allUsers.map(u => u.email));
      await mongoose.disconnect();
      process.exit(1);
    }
    
    console.log('✅ Found user:', user.username, user.email);
    
    // Check ALL posts by this user (including deleted)
    const allPosts = await Post.find({ author: user._id });
    console.log('📋 Total posts by user (including deleted):', allPosts.length);
    
    // Check posts not deleted
    const activePosts = await Post.find({ author: user._id, isDeleted: false });
    console.log('📋 Active posts (isDeleted: false):', activePosts.length);
    
    // Check posts with isDeleted: null or undefined
    const nullDeleted = await Post.find({ author: user._id, isDeleted: { $in: [null, undefined] } });
    console.log('📋 Posts with isDeleted null/undefined:', nullDeleted.length);
    
    // Check posts with isDeleted: true (soft deleted)
    const softDeleted = await Post.find({ author: user._id, isDeleted: true });
    console.log('📋 Soft deleted posts (isDeleted: true):', softDeleted.length);
    
    // If there are soft-deleted posts, let's un-delete them for testing
    if (softDeleted.length > 0) {
      console.log('\n📋 Restoring soft-deleted posts...');
      for (const post of softDeleted) {
        post.isDeleted = false;
        post.deletedAt = undefined;
        post.deletedBy = undefined;
        await post.save();
        console.log('  ✅ Restored post:', post._id);
      }
    }
    
    // If there are no posts, create a test post
    const totalActive = activePosts.length + nullDeleted.length;
    if (totalActive === 0) {
      console.log('\n📋 No active posts found. Creating a test post...');
      const post = new Post({
        content: 'Hello! This is my first post on AI Nexus. Excited to explore the future of AI technology!',
        postType: 'normal',
        author: user._id,
        isPublic: true,
        likes: [],
        comments: [],
        shares: [],
        media: { images: [], video: '', document: '' },
        isDeleted: false
      });
      await post.save();
      console.log('✅ Created test post with ID:', post._id);
    }
    
    // Show final count
    const finalActive = await Post.find({ author: user._id, isDeleted: { $ne: true } });
    console.log('\n✅ Final active posts count:', finalActive.length);
    
    if (finalActive.length > 0) {
      console.log('📋 Active posts:');
      finalActive.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.content?.substring(0, 50)}...`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done! Please refresh your dashboard to see the posts.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixUserPosts();

