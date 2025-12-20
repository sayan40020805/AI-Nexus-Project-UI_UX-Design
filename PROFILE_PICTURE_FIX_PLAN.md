# Profile Picture Display Fix - Implementation Plan

## Problem Summary
Profile pictures are not displaying due to incorrect API URL handling, missing image URLs, and lack of proper fallback images.

## Comprehensive Fix Plan

### Phase 1: Environment Configuration
- [ ] **Create environment configuration file**
  - Add `.env` file with proper VITE_API_URL
  - Update all components to use consistent API base URL
  - Ensure relative URLs are converted to absolute URLs

### Phase 2: Backend URL Response Fix  
- [ ] **Update User model and auth response**
  - Modify auth routes to return full URLs for profile pictures
  - Ensure profilePicture URLs include full backend base URL
  - Test API response structure

### Phase 3: Frontend Component Updates
- [ ] **Fix AuthContext API calls**
  - Update AuthContext to use full API URLs instead of relative paths
  - Fix `/api/auth/me` to use `${VITE_API_URL}/api/auth/me`

- [ ] **Update PostCard component**
  - Fix profile picture URL construction
  - Add proper fallback images
  - Ensure company logo handling works correctly

- [ ] **Update Dashboard components**
  - Fix UserDashboard profile picture display
  - Fix CompanyDashboard company logo display
  - Add consistent error handling

- [ ] **Update other UI components**
  - Fix ModernSidebar search results
  - Fix Messaging components
  - Fix PostComments component
  - Fix Header component

### Phase 4: Default Images
- [ ] **Add default avatar images**
  - Create `/public/default-avatar.png`
  - Create `/public/default-company-logo.png`
  - Update all fallback references

### Phase 5: Testing & Validation
- [ ] **Test profile picture upload and display**
- [ ] **Test authentication and image access**
- [ ] **Test all fallback scenarios**
- [ ] **Verify cross-browser compatibility**

## Files to Modify

### Backend Files:
- `backend/routes/auth.js` - Fix profile picture URL responses
- `backend/models/User.js` - (if needed for URL formatting)

### Frontend Files:
- `Ai_Nexus/src/context/AuthContext.jsx` - Fix API URLs
- `Ai_Nexus/src/components/PostCard/PostCard.jsx` - Fix profile pictures
- `Ai_Nexus/src/components/PostCard/PostComments.jsx` - Fix comment avatars
- `Ai_Nexus/src/pages/Dashboard/UserDashboard.jsx` - Fix user profile pics
- `Ai_Nexus/src/pages/Dashboard/CompanyDashboard.jsx` - Fix company logos
- `Ai_Nexus/src/components/ModernSidebar.jsx` - Fix search result avatars
- `Ai_Nexus/src/components/Messaging/FloatingMessageButton.jsx` - Fix message avatars
- `Ai_Nexus/src/components/Header.jsx` - Fix header avatar

### New Files:
- `Ai_Nexus/public/default-avatar.png` - Default user avatar
- `Ai_Nexus/public/default-company-logo.png` - Default company logo
- `Ai_Nexus/.env` - Environment configuration

## Success Criteria
1. ✅ Profile pictures display correctly in all components
2. ✅ Company logos display correctly in dashboards
3. ✅ Default avatars show when no image is uploaded
4. ✅ All API calls use consistent URLs
5. ✅ Image loading errors are handled gracefully
6. ✅ Authentication works with image access

## Estimated Implementation Time
- Phase 1: 15 minutes
- Phase 2: 20 minutes  
- Phase 3: 45 minutes
- Phase 4: 10 minutes
- Phase 5: 20 minutes
- **Total: ~2 hours**
