const axios = require('axios');

async function testSignup() {
  try {
    console.log('Testing signup endpoint...');
    
    const response = await axios.post('http://localhost:5001/api/auth/signup', {
      role: 'user',
      username: 'testuser123',
      email: 'test123@example.com',
      password: 'TestPass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ HTTP Error:', error.response.status);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      console.log('❌ Request failed:', error.message);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testSignup();
