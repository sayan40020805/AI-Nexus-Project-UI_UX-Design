# Model Post Debug Plan

## Problem Analysis
- 500 Internal Server Error when creating "Model" posts
- Normal image posts work perfectly
- Error occurs in PostForm.jsx during handleFormSubmit()
- Backend endpoint: POST /api/posts

## Root Cause Analysis

### 1. Field Mismatch Issue
- **Backend expects**: `content` field as required (in Post.js schema)
- **Current AiModelsForm sends**: `postType`, `modelName`, `description`, etc.
- **Missing**: `content` field which is required by the backend

### 2. Backend Validation
- Post.js schema shows `content` is required: `required: true`
- Backend posts.js doesn't have additional validation for required fields
- This causes MongoDB to reject the document creation

### 3. File Upload Logic
- Backend supports multer file uploads
- Model posts should handle image uploads correctly
- Current logic seems sound for file handling

## Solution Plan

### Phase 1: Fix Frontend Form
1. Update AiModelsForm.jsx to include required `content` field
2. Map form data properly to backend expectations
3. Ensure file handling matches backend requirements

### Phase 2: Backend Validation
1. Add proper error logging in posts.js
2. Validate required fields before MongoDB insertion
3. Return meaningful error messages

### Phase 3: Test & Validation
1. Test model post creation
2. Verify filtering works correctly
3. Ensure no breaking changes to existing functionality

## Key Changes Required

1. **AiModelsForm.jsx**: Add content field mapping
2. **posts.js**: Enhanced error logging and validation
3. **PostForm.jsx**: Ensure proper payload structure

## Expected Outcome
- Model posts create successfully
- Posts appear under "Models" tab only
- No breaking changes to existing image post functionality
