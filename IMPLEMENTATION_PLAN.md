ok
# AI Nexus Platform - Implementation Plan

## Analysis Summary

After analyzing the codebase, I've identified the following issues and their solutions:

### Current State Assessment

1. **Dashboard Components**: UserDashboard.jsx and CompanyDashboard.jsx exist with basic profile display
2. **Post Creation System**: Complete form system exists in PostCreation/forms/ with proper structure
3. **Live Page**: Has UI but uses hardcoded data instead of backend integration
4. **Post Model**: Properly structured with postType field for categorization
5. **Routing**: Basic routing exists but needs category-based post filtering

## Implementation Plan

### Phase 1: Profile System Enhancement

**Issue**: Dashboard profile images not fetching from backend
**Files to Modify**:
- `Ai_Nexus/src/pages/Dashboard/UserDashboard.jsx`
- `Ai_Nexus/src/pages/Dashboard/CompanyDashboard.jsx`
- Backend API routes for user/company profile data

**Actions**:
- Update profile picture fetching to use real user data
- Add profile edit functionality
- Connect to existing user upload system

### Phase 2: Live Section Backend Integration

**Issue**: Live page uses hardcoded data instead of real video files
**Files to Modify**:
- `Ai_Nexus/src/pages/Live/Live.jsx`
- `backend/routes/live.js` (if exists)
- Live session model and API

**Actions**:
- Replace hardcoded liveStreamsData with API calls
- Connect to existing live session management
- Ensure proper video file linking

### Phase 3: Post Creation System Completion

**Issue**: AI News and AI Showcase forms may not be fully functional
**Files to Modify**:
- `Ai_Nexus/src/components/PostCreation/forms/AiNewsForm.jsx`
- `Ai_Nexus/src/components/PostCreation/forms/AiShowcaseForm.jsx`
- `backend/routes/posts.js`

**Actions**:
- Ensure forms submit correctly to backend
- Add proper error handling and validation
- Test file upload functionality

### Phase 4: Category-Based Post Routing

**Issue**: Posts not routing correctly by category
**Files to Create/Modify**:
- `Ai_Nexus/src/pages/AIShorts/AiShorts.jsx`
- `Ai_Nexus/src/pages/AIShowcase/AIShowcase.jsx` 
- `Ai_Nexus/src/pages/AI News/News.jsx` (create if missing)
- Update existing pages to filter by postType

**Actions**:
- Create missing page components
- Implement post filtering by postType
- Ensure proper navigation between categories

### Phase 5: Dashboard Settings Functionality

**Issue**: Edit Company Profile and Company Settings not working
**Files to Modify**:
- `Ai_Nexus/src/pages/Dashboard/CompanyDashboard.jsx`
- `Ai_Nexus/src/pages/Dashboard/UserDashboard.jsx`
- Create settings components

**Actions**:
- Add modal/page components for settings
- Connect to backend profile update APIs
- Implement form validation

### Phase 6: Home Page Profile Navigation

**Issue**: View Profile button not working in Hero component
**Files to Modify**:
- `Ai_Nexus/src/components/Hero/FeedLayout.jsx`
- Add proper navigation logic

**Actions**:
- Update "View Profile" button to navigate to dashboard
- Ensure proper role-based navigation
- Add loading states

## Technical Approach

### Database Integration
- Leverage existing User model with profile picture support
- Use Post model postType field for categorization
- Connect to existing upload system for media files

### Frontend Architecture
- Maintain existing component structure
- Add proper state management for profile data
- Implement loading and error states

### Backend API Enhancement
- Extend existing auth/user routes for profile management
- Add post filtering endpoints by category
- Enhance live session management

### Security & Validation
- Role-based access control (user vs company features)
- File upload validation and sanitization
- Proper error handling and user feedback

## Testing Strategy

1. **Unit Testing**: Test individual components and forms
2. **Integration Testing**: Test end-to-end post creation flow
3. **User Flow Testing**: Test complete user journeys
4. **Role Testing**: Test both user and company role functionalities

## Success Criteria

✅ Dashboard displays real profile pictures from user data
✅ Live section connects to existing video files and sessions
✅ AI News and AI Showcase forms are fully functional
✅ Posts appear in correct category pages
✅ Dashboard settings (edit profile, company settings) work
✅ Home page "View Profile" navigates correctly
✅ No duplicate files or redundant functionality
✅ Clean, maintainable code following project standards

## Estimated Timeline

- **Phase 1**: Profile Enhancement - 1-2 hours
- **Phase 2**: Live Integration - 1-2 hours  
- **Phase 3**: Post Creation - 1 hour
- **Phase 4**: Category Routing - 2-3 hours
- **Phase 5**: Dashboard Settings - 2 hours
- **Phase 6**: Profile Navigation - 30 minutes

**Total Estimated Time**: 7.5-10.5 hours

This plan ensures we fix all reported issues while maintaining the existing codebase structure and adding minimal new files.
