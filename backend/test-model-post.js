// Test script to verify model post creation works
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001';

// Test model post creation
async function testModelPostCreation() {
  console.log('🧪 Testing Model Post Creation...\n');

  try {
    // First, get a valid auth token (you'll need to replace with actual credentials)
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with real user
        password: 'password123' // Replace with real password
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed. Please update test credentials.');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Test model post creation with required fields
    const modelPostData = new FormData();
    modelPostData.append('postType', 'ai_models');
    modelPostData.append('content', 'GPT-4: Advanced Language Model\n\nThis is a state-of-the-art language model with advanced reasoning capabilities.');
    modelPostData.append('modelName', 'GPT-4');
    modelPostData.append('modelType', 'language-model');
    modelPostData.append('description', 'Advanced language model with enhanced reasoning capabilities');
    modelPostData.append('category', 'nlp');
    modelPostData.append('pricing', 'paid');
    modelPostData.append('company', 'OpenAI');
    modelPostData.append('githubUrl', 'https://github.com/openai/gpt-4');
    modelPostData.append('demoUrl', 'https://chat.openai.com');

    console.log('📤 Sending model post request...');
    
    const createResponse = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: modelPostData
    });

    const responseData = await createResponse.json();

    if (createResponse.ok) {
      console.log('✅ Model post created successfully!');
      console.log('📄 Response:', JSON.stringify(responseData, null, 2));
    } else {
      console.log('❌ Model post creation failed');
      console.log('📄 Error response:', JSON.stringify(responseData, null, 2));
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

// Test the filtering endpoints
async function testFiltering() {
  console.log('\n🧪 Testing Post Filtering...\n');

  try {
    // Test model posts endpoint
    console.log('📋 Testing /api/feed/by-type/ai_models...');
    const modelResponse = await fetch(`${API_BASE}/api/feed/by-type/ai_models?page=1&limit=10`);
    const modelData = await modelResponse.json();
    
    if (modelResponse.ok) {
      console.log(`✅ Found ${modelData.posts?.length || 0} AI model posts`);
      console.log('📄 Response structure:', Object.keys(modelData));
    } else {
      console.log('❌ Failed to fetch AI model posts');
      console.log('📄 Error:', modelData);
    }

    // Test AI news endpoint
    console.log('\n📋 Testing /api/feed/by-type/ai_news...');
    const newsResponse = await fetch(`${API_BASE}/api/feed/by-type/ai_news?page=1&limit=10`);
    const newsData = await newsResponse.json();
    
    if (newsResponse.ok) {
      console.log(`✅ Found ${newsData.posts?.length || 0} AI news posts`);
    } else {
      console.log('❌ Failed to fetch AI news posts');
    }

  } catch (error) {
    console.error('💥 Filtering test error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Model Post Tests\n');
  
  await testModelPostCreation();
  await testFiltering();
  
  console.log('\n✅ Tests completed!');
}

// Note: This test requires valid user credentials
// Please update the login credentials before running
runTests();
