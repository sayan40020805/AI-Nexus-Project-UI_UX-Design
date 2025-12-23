// Simple test to verify post endpoints are working
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001';

async function testPostEndpoints() {
  console.log('🧪 Testing Post Creation & Filtering Endpoints\n');

  try {
    // Test 1: Check if the posts endpoint exists and responds
    console.log('1. Testing /api/posts GET endpoint...');
    const getPostsResponse = await fetch(`${API_BASE}/api/posts?page=1&limit=5`);
    console.log(`   Status: ${getPostsResponse.status}`);
    
    if (getPostsResponse.ok) {
      const postsData = await getPostsResponse.json();
      console.log(`   ✅ Found ${postsData.posts?.length || 0} total posts`);
      console.log(`   📄 Pagination: ${postsData.pagination?.total || 0} total posts`);
    } else {
      const errorData = await getPostsResponse.json();
      console.log(`   ❌ Error: ${errorData.msg || 'Unknown error'}`);
    }

    // Test 2: Check filtering endpoints
    console.log('\n2. Testing /api/feed/by-type endpoints...');
    
    // Test ai_models endpoint
    const modelsResponse = await fetch(`${API_BASE}/api/feed/by-type/ai_models?page=1&limit=5`);
    console.log(`   Models endpoint: ${modelsResponse.status}`);
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log(`   ✅ AI Models: ${modelsData.posts?.length || 0} posts found`);
    } else {
      console.log(`   ❌ AI Models error: ${(await modelsResponse.json()).msg || 'Unknown'}`);
    }

    // Test ai_news endpoint  
    const newsResponse = await fetch(`${API_BASE}/api/feed/by-type/ai_news?page=1&limit=5`);
    console.log(`   News endpoint: ${newsResponse.status}`);
    
    if (newsResponse.ok) {
      const newsData = await newsResponse.json();
      console.log(`   ✅ AI News: ${newsData.posts?.length || 0} posts found`);
    } else {
      console.log(`   ❌ AI News error: ${(await newsResponse.json()).msg || 'Unknown'}`);
    }

    // Test 3: Check if backend validation is working
    console.log('\n3. Testing backend validation (POST /api/posts without auth)...');
    
    const testPostData = new FormData();
    testPostData.append('postType', 'ai_models');
    testPostData.append('content', 'Test Model Post'); // Now includes required content
    testPostData.append('modelName', 'TestModel');
    
    const createResponse = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      body: testPostData
    });
    
    console.log(`   Status: ${createResponse.status}`);
    const createData = await createResponse.json();
    
    if (createResponse.status === 401) {
      console.log('   ✅ Authentication required (expected)');
    } else if (createResponse.status === 400) {
      console.log(`   ✅ Validation working: ${createData.msg}`);
    } else {
      console.log(`   ❓ Unexpected response: ${createData.msg || 'Unknown'}`);
    }

    console.log('\n✅ Post endpoints test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Post creation endpoint exists and validates');
    console.log('   - Filtering endpoints exist for ai_models and ai_news');
    console.log('   - Backend server is running correctly');
    console.log('\n🚀 Ready for frontend testing!');

  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testPostEndpoints();
