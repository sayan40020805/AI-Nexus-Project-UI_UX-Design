// Debug script to understand the upload middleware issue
console.log('=== DEBUGGING UPLOAD MIDDLEWARE ===');

try {
  const { upload } = require('./middleware/upload');
  
  console.log('Upload object:', upload);
  console.log('Upload type:', typeof upload);
  console.log('Upload keys:', Object.keys(upload));
  
  // Test single method
  const singleResult = upload.single('image');
  console.log('upload.single result:', singleResult);
  console.log('upload.single result type:', typeof singleResult);
  
  if (typeof singleResult === 'function') {
    console.log('✅ upload.single is a function - this should work');
  } else {
    console.log('❌ upload.single is NOT a function - this is the problem');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
