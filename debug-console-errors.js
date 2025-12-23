// Test script to debug console errors
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001/api';

async function testEndpoints() {
  console.log('🔍 Testing API endpoints to identify console error sources...\n');

  try {
    // Test 1: Events endpoint (main issue)
    console.log('1. Testing events endpoint...');
    const eventsResponse = await fetch(`${API_BASE}/events?status=published`);
    console.log(`   Status: ${eventsResponse.status}`);
    
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      console.log(`   ✅ Events endpoint works - Found ${eventsData.events?.length || 0} events`);
    } else {
      const errorText = await eventsResponse.text();
      console.log(`   ❌ Events endpoint failed: ${eventsResponse.status}`);
      console.log(`   Error: ${errorText.substring(0, 200)}...`);
    }

    // Test 2: Auth endpoint (CORS issue)
    console.log('\n2. Testing auth endpoint (CORS test)...');
    try {
      const authResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Origin': 'http://127.0.0.1:5173',
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log(`   Status: ${authResponse.status}`);
      
      if (authResponse.status === 401) {
        console.log('   ✅ Auth endpoint accessible (401 expected for invalid token)');
      } else if (authResponse.status === 403) {
        console.log('   ⚠️  CORS blocking detected (403 for CORS preflight)');
      } else {
        console.log(`   ❌ Unexpected status: ${authResponse.status}`);
      }
    } catch (err) {
      console.log(`   ❌ Network error: ${err.message}`);
    }

    // Test 3: Health check
    console.log('\n3. Testing health check...');
    const healthResponse = await fetch('http://localhost:5001/health');
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   ✅ Server healthy: ${healthData.status}`);
    } else {
      console.log(`   ❌ Server health check failed`);
    }

    // Test 4: Database connection via events endpoint
    console.log('\n4. Testing database connection...');
    try {
      const dbTestResponse = await fetch(`${API_BASE}/events?limit=1`);
      if (dbTestResponse.ok) {
        console.log('   ✅ Database connection working');
      } else {
        console.log('   ❌ Database connection issues detected');
      }
    } catch (err) {
      console.log(`   ❌ Database test failed: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testEndpoints().then(() => {
  console.log('\n🏁 Debug test completed. Use results to guide fixes.');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
