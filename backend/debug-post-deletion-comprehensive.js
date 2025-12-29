#!/usr/bin/env node

/**
 * Comprehensive Post Deletion Debug Script
 * 
 * This script traces the entire data flow from backend to frontend to identify
 * where post._id gets lost or corrupted during the post deletion process.
 * 
 * Usage:
 *   node debug-post-deletion-comprehensive.js <authToken>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = 'http://localhost:5001';
const LOG_PREFIX = '🔍 COMPREHENSIVE DEBUG';

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const color = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    debug: '\x1b[35m'    // Magenta
  }[type] || '\x1b[0m';
  
  console.log(`${color}${LOG_PREFIX} [${timestamp}] ${message}\x1b[0m`);
}

function logObject(obj, title = 'Object') {
  log(`${title}:`, 'debug');
  console.log(JSON.stringify(obj, null, 2));
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    log(`Request failed: ${error.message}`, 'error');
    return { error: error.message };
  }
}

async function testBackendEndpoints(authToken) {
  log('🧪 TESTING BACKEND ENDPOINTS', 'info');
  
  // Test 1: Feed endpoint
  log('📡 Testing /api/feed endpoint...', 'info');
  const feedResponse = await makeRequest(`${API_BASE}/api/feed`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (feedResponse.error) {
    log(`❌ Feed endpoint failed: ${feedResponse.error}`, 'error');
    return;
  }
  
  if (!feedResponse.ok) {
    log(`❌ Feed endpoint error: ${feedResponse.status} - ${feedResponse.data.msg || 'Unknown error'}`, 'error');
    return;
  }
  
  const posts = feedResponse.data.posts || [];
  log(`✅ Feed endpoint successful. Received ${posts.length} posts`, 'success');
  
  if (posts.length === 0) {
    log('⚠️  No posts found in feed. Creating test data...', 'warning');
    return await createTestData(authToken);
  }
  
  // Analyze post structure
  log('🔍 ANALYZING POST STRUCTURE', 'info');
  posts.forEach((post, index) => {
    log(`Post ${index + 1}:`, 'debug');
    logObject({
      _id: post._id,
      has_id: !!post._id,
      id_type: typeof post._id,
      id_length: post._id ? post._id.length : 0,
      content_preview: post.content ? post.content.substring(0, 50) : 'No content',
      author: post.author ? {
        username: post.author.username,
        companyName: post.author.companyName,
        role: post.author.role
      } : 'No author',
      createdAt: post.createdAt,
      keys: Object.keys(post)
    }, 'Post Structure');
  });
  
  return posts;
}

async function createTestData(authToken) {
  log('📝 CREATING TEST POST DATA', 'info');
  
  // Create a test post
  const testPost = {
    content: '🧪 Test post for deletion debugging - ' + new Date().toISOString(),
    postType: 'normal',
    isPublic: true
  };
  
  const createResponse = await makeRequest(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testPost)
  });
  
  if (createResponse.ok) {
    log('✅ Test post created successfully', 'success');
    logObject(createResponse.data, 'Created Post');
    return [createResponse.data.post];
  } else {
    log(`❌ Failed to create test post: ${createResponse.status}`, 'error');
    return [];
  }
}

async function testPostDeletion(authToken, posts) {
  if (!posts || posts.length === 0) {
    log('❌ No posts available for deletion testing', 'error');
    return;
  }
  
  const testPost = posts[0];
  const postId = testPost._id;
  
  if (!postId) {
    log('❌ Test post has no _id field!', 'error');
    logObject(testPost, 'Problematic Post');
    return;
  }
  
  log(`🗑️ TESTING POST DELETION for ID: ${postId}`, 'info');
  
  // Test the deletion endpoint directly
  const deleteResponse = await makeRequest(`${API_BASE}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (deleteResponse.ok) {
    log('✅ Direct deletion successful', 'success');
  } else {
    log(`❌ Direct deletion failed: ${deleteResponse.status}`, 'error');
    logObject(deleteResponse.data, 'Delete Response');
  }
  
  return postId;
}

function generateFrontendFix(postId) {
  const fixScript = `
// FRONTEND FIX SCRIPT - Add this to your frontend component
const fixPostData = (posts) => {
  return posts.map((post, index) => {
    // Log original post data
    console.log('🔍 Processing post ${index + 1}:', {
      original_id: post._id,
      has_original_id: !!post._id,
      original_keys: Object.keys(post)
    });
    
    // Ensure post has valid ID
    if (!post._id) {
      console.error('❌ Post missing _id field:', post);
      
      // Try alternative ID fields
      const alternativeId = post.id || post.postId || \`temp_\${Date.now()}_\${index}\`;
      console.log('🔧 Using alternative ID:', alternativeId);
      
      return {
        ...post,
        _id: alternativeId,
        original_id: post._id,
        id_source: post.id ? 'id' : post.postId ? 'postId' : 'generated'
      };
    }
    
    return post;
  });
};

// Apply the fix to your posts data
const fixedPosts = fixPostData(posts);
console.log('✅ Fixed posts:', fixedPosts.map(p => ({ id: p._id, has_id: !!p._id })));
`;
  
  log('📝 FRONTEND FIX SCRIPT GENERATED', 'info');
  console.log(fixScript);
  
  return fixScript;
}

function saveDebugReport(data) {
  const reportPath = path.join(__dirname, 'post-deletion-debug-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));
  log(`📄 Debug report saved to: ${reportPath}`, 'success');
}

async function main() {
  const authToken = process.argv[2];
  
  if (!authToken) {
    log('❌ Usage: node debug-post-deletion-comprehensive.js <authToken>', 'error');
    log('💡 Get your auth token from browser localStorage after logging in', 'info');
    process.exit(1);
  }
  
  log('🚀 STARTING COMPREHENSIVE POST DELETION DEBUG', 'info');
  log(`🔑 Using auth token: ${authToken.substring(0, 20)}...`, 'info');
  
  const debugData = {
    timestamp: new Date().toISOString(),
    authToken: authToken.substring(0, 20) + '...',
    steps: []
  };
  
  try {
    // Step 1: Test backend endpoints
    log('📋 STEP 1: Testing Backend Endpoints', 'info');
    const posts = await testBackendEndpoints(authToken);
    debugData.steps.push({ step: 'backend_test', posts: posts?.length || 0, success: !!posts });
    
    if (posts && posts.length > 0) {
      // Step 2: Test post deletion
      log('📋 STEP 2: Testing Post Deletion', 'info');
      const deletedPostId = await testPostDeletion(authToken, posts);
      debugData.steps.push({ step: 'deletion_test', postId: deletedPostId, success: !!deletedPostId });
      
      // Step 3: Generate frontend fix
      log('📋 STEP 3: Generating Frontend Fix', 'info');
      const fixScript = generateFrontendFix(deletedPostId);
      debugData.steps.push({ step: 'fix_generation', success: true });
    }
    
    // Step 4: Summary
    log('📋 STEP 4: Debug Summary', 'info');
    const successCount = debugData.steps.filter(step => step.success).length;
    const totalSteps = debugData.steps.length;
    
    log(`📊 Debug completed: ${successCount}/${totalSteps} steps successful`, 'info');
    
    if (successCount === totalSteps) {
      log('✅ All tests passed! Post deletion should work correctly.', 'success');
    } else {
      log('❌ Some tests failed. Check the debug output above.', 'error');
    }
    
  } catch (error) {
    log(`❌ Debug failed: ${error.message}`, 'error');
    debugData.error = error.message;
  }
  
  // Save debug report
  saveDebugReport(debugData);
  
  log('🏁 COMPREHENSIVE DEBUG COMPLETED', 'info');
}

// Run the debug script
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { main, makeRequest, testBackendEndpoints, testPostDeletion };
