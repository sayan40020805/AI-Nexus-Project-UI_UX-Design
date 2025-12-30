# Profile Picture & Background Display Fix Plan

## Problem Analysis
Based on investigation:
- ✅ Backend is serving images correctly at `http://localhost:5001/uploads/...`
- ✅ `.env` files are configured properly 
- ✅ Default avatar exists in `Ai_Nexus/public/default-avatar.svg`
- ✅ BASE_URL is correctly set as `http://localhost:5001`
- ✅ CORS is properly configured

## Root Causes Identified
1. **Frontend URL Construction**: The frontend may not be properly constructing full image URLs
2. **Error Handling**: Missing fallback handling for broken images
3. **Background Image Support**: Profile page doesn't support background/cover images
4. **Image Path Normalization**: Inconsistent path handling between backend responses and frontend expectations

## Implementation Steps

### Phase 1: Enhanced Image URL Handling
- [ ] Create utility function for consistent image URL construction
- [ ] Update ProfilePage.jsx to handle both profile pictures and cover photos
- [ ] Add robust error handling for failed image loads
- [ ] Implement proper fallback mechanisms

### Phase 2: Backend Improvements  
- [ ] Ensure all user endpoints return properly formatted image URLs
- [ ] Add cover photo support to user model and endpoints
- [ ] Test image serving endpoints

### Phase 3: Frontend Enhancements
- [ ] Update ProfilePage.jsx with better image handling
- [ ] Add cover photo upload and display functionality
- [ ] Implement image optimization and loading states
- [ ] Add debugging tools for image loading

### Phase 4: Testing & Validation
- [ ] Test image display across different user types
- [ ] Verify fallback mechanisms work correctly
- [ ] Test cover photo functionality
- [ ] Validate responsive behavior

## Expected Outcomes
- ✅ Profile pictures display correctly for all users
- ✅ Cover photos can be uploaded and displayed
- ✅ Robust fallback to default avatar when images fail
- ✅ Consistent image URL handling across the application
- ✅ Better user experience with loading states

## Files to Modify
1. `Ai_Nexus/src/utils/imageUtils.js` - Image URL utility functions
2. `Ai_Nexus/src/pages/Profile/ProfilePage.jsx` - Enhanced image handling
3. `backend/models/User.js` - Add cover photo support
4. `backend/routes/auth.js` - Return cover photo in user data
5. `Ai_Nexus/src/components/Header.jsx` - Fix header avatar display

## Status: STARTING IMPLEMENTATION
