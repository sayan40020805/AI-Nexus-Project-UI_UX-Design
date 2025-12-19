#!/usr/bin/env node

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5001';
const API_BASE = `${BASE_URL}/api/auth`;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (err) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testRegistration() {
  console.log('\n=== Testing User Registration ===');
  

  const userData = {
    role: 'user',
    username: `testuser${Date.now()}`,
    email: `testuser${Date.now()}@example.com`,
    password: 'TestPass123'
  };

  try {
    const response = await makeRequest('POST', `${API_BASE}/signup`, userData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 201) {
      console.log('✅ User registration successful');
      return response.body.token;
    } else {
      console.log('❌ User registration failed');
      return null;
    }
  } catch (err) {
    console.error('❌ User registration error:', err.message);
    return null;
  }
}

async function testCompanyRegistration() {
  console.log('\n=== Testing Company Registration ===');
  

  const companyData = {
    role: 'company',
    companyName: `Test Company ${Date.now()}`,
    email: `testcompany${Date.now()}@example.com`,
    password: 'TestPass123',
    companyDescription: 'A test company for AI Nexus'
  };

  try {
    const response = await makeRequest('POST', `${API_BASE}/signup`, companyData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 201) {
      console.log('✅ Company registration successful');
      return response.body.token;
    } else {
      console.log('❌ Company registration failed');
      return null;
    }
  } catch (err) {
    console.error('❌ Company registration error:', err.message);
    return null;
  }
}

async function testLogin(email, password) {
  console.log('\n=== Testing Login ===');
  
  try {
    const response = await makeRequest('POST', `${API_BASE}/login`, {
      email,
      password
    });
    
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Login successful');
      return response.body.token;
    } else {
      console.log('❌ Login failed');
      return null;
    }
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return null;
  }
}

async function testMeEndpoint(token, expectedRole) {
  console.log(`\n=== Testing /me endpoint (${expectedRole}) ===`);
  
  try {
    const response = await makeRequest('GET', `${API_BASE}/me`, null, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200 && response.body.user.role === expectedRole) {
      console.log('✅ /me endpoint successful');
      return response.body.user;
    } else {
      console.log('❌ /me endpoint failed');
      return null;
    }
  } catch (err) {
    console.error('❌ /me endpoint error:', err.message);
    return null;
  }
}

async function testRoleBasedAccess(token, role, endpoint) {
  console.log(`\n=== Testing ${endpoint} (${role}) ===`);
  
  try {
    const response = await makeRequest('GET', `${endpoint}`, null, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Role-based access successful');
      return true;
    } else {
      console.log('❌ Role-based access failed');
      return false;
    }
  } catch (err) {
    console.error('❌ Role-based access error:', err.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Authentication System Tests');
  console.log('=======================================');

  // Test 1: User Registration
  const userToken = await testRegistration();
  if (!userToken) {
    console.log('\n❌ Stopping tests: User registration failed');
    return;
  }

  // Test 2: Company Registration  
  const companyToken = await testCompanyRegistration();
  if (!companyToken) {
    console.log('\n❌ Stopping tests: Company registration failed');
    return;
  }

  // Test 3: User Login
  const loginToken = await testLogin('testuser@example.com', 'TestPass123');
  if (!loginToken) {
    console.log('\n❌ Stopping tests: User login failed');
    return;
  }

  // Test 4: /me endpoint for user
  const userData = await testMeEndpoint(userToken, 'user');
  if (!userData) {
    console.log('\n❌ Stopping tests: User /me endpoint failed');
    return;
  }

  // Test 5: /me endpoint for company
  const companyData = await testMeEndpoint(companyToken, 'company');
  if (!companyData) {
    console.log('\n❌ Stopping tests: Company /me endpoint failed');
    return;
  }

  // Test 6: Role-based access for user
  await testRoleBasedAccess(userToken, 'user', '/api/user/profile');

  // Test 7: Role-based access for company
  await testRoleBasedAccess(companyToken, 'company', '/api/company/profile');

  // Test 8: Test wrong role access (should fail)
  console.log('\n=== Testing Wrong Role Access (Should Fail) ===');
  await testRoleBasedAccess(userToken, 'user', '/api/company/profile');

  console.log('\n🎉 All tests completed!');
  console.log('=======================================');
}

// Run the tests
runTests().catch(console.error);
