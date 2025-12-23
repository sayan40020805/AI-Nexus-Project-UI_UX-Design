// Simple test to verify upload import fix
console.log('Testing upload import fix...');

try {
  // Test the exact import that was fixed
  const { upload } = require('./middleware/upload');
  
  console.log('✅ SUCCESS: Upload middleware imported correctly');
  console.log('Upload function type:', typeof upload);
  console.log('Upload has single method:', typeof upload.single);
  
  if (typeof upload.single === 'function') {
    console.log('✅ FIX VERIFIED: upload.single is now a function!');
  } else {
    console.log('❌ ISSUE: upload.single is still not a function');
  }
  
} catch (error) {
  console.error('❌ ERROR: Failed to import upload middleware');
  console.error('Error details:', error.message);
}
