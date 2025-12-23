// Debug script to test the AI Models endpoint and capture detailed logs
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001';

async function debugAiModelsEndpoint() {
  try {
    console.log('🔍 Starting AI Models endpoint debug...');
    
    // First, let's try to login to get a valid token
    console.log('🔑 Attempting to login for token...');
    
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log('🔑 Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const loginError = await loginResponse.text();
      console.log('🔑 Login failed:', loginError);
      
      // Try with a different test account
      console.log('🔑 Trying alternative login...');
      const altLoginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123'
        })
      });
      
      console.log('🔑 Alternative login status:', altLoginResponse.status);
      
      if (!altLoginResponse.ok) {
        console.log('❌ Could not get valid token for testing');
        console.log('💡 Please ensure you have a valid user account to test with');
        return;
      }
      
      const altLoginData = await altLoginResponse.json();
      const token = altLoginData.token;
      console.log('🔑 Got token from alternative login');
      
      // Now test the AI Models endpoint
      console.log('📋 Testing AI Models endpoint...');
      const response = await fetch(`${API_BASE}/api/feed/by-type/ai_models?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📋 AI Models endpoint response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! AI Models data:', {
          postType: data.postType,
          totalPosts: data.pagination?.total || 0,
          currentPage: data.pagination?.current || 0,
          postsReturned: data.posts?.length || 0
        });
      } else {
        const errorText = await response.text();
        console.log('❌ AI Models endpoint failed:', errorText);
      }
      
    } else {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('🔑 Got token from login');
      
      // Now test the AI Models endpoint
      console.log('📋 Testing AI Models endpoint...');
      const response = await fetch(`${API_BASE}/api/feed/by-type/ai_models?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📋 AI Models endpoint response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! AI Models data:', {
          postType: data.postType,
          totalPosts: data.pagination?.total || 0,
          currentPage: data.pagination?.current || 0,
          postsReturned: data.posts?.length || 0
        });
      } else {
        const errorText = await response.text();
        console.log('❌ AI Models endpoint failed:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Run the debug
debugAiModelsEndpoint();
