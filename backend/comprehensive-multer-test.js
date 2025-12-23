// Complete multer test and fix verification
console.log('=== COMPREHENSIVE MULTER DEBUG ===');

try {
  // Test multer import
  const multer = require('multer');
  console.log('✅ Multer imported successfully');
  console.log('Multer version:', require('multer/package.json').version);
  
  // Test upload middleware import
  const { upload } = require('./middleware/upload');
  console.log('✅ Upload middleware imported successfully');
  console.log('Upload type:', typeof upload);
  console.log('Upload constructor:', upload.constructor.name);
  
  // Test single method
  const singleMiddleware = upload.single('image');
  console.log('upload.single result type:', typeof singleMiddleware);
  console.log('upload.single result:', singleMiddleware);
  
  if (typeof singleMiddleware === 'function') {
    console.log('✅ SUCCESS: upload.single returns a function');
  } else {
    console.log('❌ ISSUE: upload.single does NOT return a function');
    console.log('This is why we get "Route.post() requires a callback function" error');
  }
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Stack:', error.stack);
}
