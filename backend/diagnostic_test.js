const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001';

async function testSignup() {
  console.log('🧪 Testing Signup Endpoint...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Simple signup without files
    console.log('2. Testing user signup...');
    const signupData = {
      role: 'user',
      username: 'testuser999',
      email: 'test999@example.com',
      password: 'TestPassword123'
    };

    console.log('Sending request with data:', signupData);

    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, signupData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('✅ Signup successful!');
    console.log('Response data:', signupResponse.data);
    console.log('');

    // Test 3: Verify user can login
    console.log('3. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test999@example.com',
      password: 'TestPassword123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('User data:', loginResponse.data.user);
    console.log('');

    // Test 4: Test profile endpoint
    console.log('4. Testing profile endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });

    console.log('✅ Profile fetch successful!');
    console.log('Profile data:', profileResponse.data);
    console.log('');

    console.log('🎉 All tests passed! The signup functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received - server may be down or not responding');
    }
    
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Check if MongoDB is connected');
    console.log('2. Verify environment variables are set');
    console.log('3. Check server logs for errors');
    console.log('4. Ensure all dependencies are installed');
  }
}

// Run the test
testSignup();
