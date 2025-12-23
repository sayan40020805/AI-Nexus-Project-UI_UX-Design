# Events Upload Middleware Fix Plan

## Problem Analysis
The error `TypeError: upload.single is not a function` occurs because of incorrect import syntax in `backend/routes/events.js`.

### Root Cause
- **Current (Broken)**: `const upload = require('../middleware/upload');`
- **Expected**: `const { upload } = require('../middleware/upload');`

The `middleware/upload.js` exports an object with multiple properties:
```javascript
module.exports = {
  upload,
  uploadFlexible,
  handleUploadError,
};
```

But `events.js` is trying to use the entire object as if it were the `upload` function.

### Evidence from Search Results
- `backend/routes/posts.js`: ✅ Correct - `const { upload } = require('../middleware/upload');`
- `backend/routes/auth.js`: ✅ Correct - `const { uploadFlexible, handleUploadError } = require('../middleware/upload');`
- `backend/routes/events.js`: ❌ Incorrect - `const upload = require('../middleware/upload');`

## Solution Plan

### Step 1: Fix Import Statement
**File**: `backend/routes/events.js`
**Line**: 6
**Change**: 
```javascript
// FROM (Broken):
const upload = require('../middleware/upload');

// TO (Fixed):
const { upload } = require('../middleware/upload');
```

### Step 2: Verify Other Routes
Check if there are other files with the same issue and fix them consistently.

### Step 3: Test the Fix
- Start the server again
- Verify no more `upload.single is not a function` errors
- Test event creation endpoint if possible

## Implementation Steps
1. ✅ Read and analyze the error
2. ✅ Identify the root cause through file search
3. ✅ Create comprehensive fix plan
4. 🔄 Apply the fix to events.js
5. 🔄 Test the server startup
6. 🔄 Verify the fix works

## Expected Outcome
- Server starts without `upload.single is not a function` error
- Event routes can properly handle file uploads
- Consistent import patterns across all route files
