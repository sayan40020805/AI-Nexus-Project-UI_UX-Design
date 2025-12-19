const http = require('http');


const testData = JSON.stringify({
  role: 'user',
  username: 'uniqueuser999',
  email: 'unique999@example.com',
  password: 'TestPass123'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Testing signup endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
    if (res.statusCode !== 201) {
      console.log('❌ Error occurred');
    } else {
      console.log('✅ Success!');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(testData);
req.end();
