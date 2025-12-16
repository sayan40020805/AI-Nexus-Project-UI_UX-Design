# Company Auth Debug & Dashboard Implementation Plan

## Issues Identified:

1. **Company Registration 500 Error**: Backend failing on company registration
2. **Mock Dashboard**: Using hardcoded user data instead of real API data
3. **No Auth State Management**: No proper authentication context
4. **No Role-Based Dashboards**: Only one dashboard for all users
5. **No Auth-Based UI Logic**: Login/Register buttons not hiding after auth

## Root Cause Analysis:

**Company Registration 500 Error:**
- The `uploadMultiple` middleware expects both `profile-pic` and `company-logo` fields
- When registering as company, only `company-logo` is sent
- This causes multer to reject the request with unexpected file field error

**Upload Middleware Issue:**
```javascript
// Current problematic code:
const uploadMultiple = upload.fields([
  { name: 'profile-pic', maxCount: 1 },
  { name: 'company-logo', maxCount: 1 }
]);
```

## Implementation Plan:

### Step 1: Fix Upload Middleware
- Make upload middleware handle optional fields properly
- Remove hard requirement for both file types

### Step 2: Fix Company Registration API
- Debug the specific error causing 500 response
- Ensure proper file handling for company-only uploads
- Add better error logging

### Step 3: Create Authentication Context
- Create AuthContext for global auth state management
- Handle login/logout, token storage, and user data
- Implement auto-login on page refresh

### Step 4: Create Role-Based Dashboard Components
- Create UserDashboard component with real API integration
- Create CompanyDashboard component
- Remove mock data from existing Dashboard component

### Step 5: Update UI Based on Auth State
- Show/hide Login/Register buttons based on auth status
- Add logout functionality
- Implement role-based navigation

### Step 6: Add Protected Routes
- Create route guards for dashboard access
- Redirect unauthorized users to login
- Redirect based on user role after login

### Step 7: Testing & Validation
- Test user registration/login
- Test company registration/login
- Verify role-based dashboard access
- Verify auth state persistence

## Files to Modify:

**Backend:**
- `backend/middleware/upload.js` - Fix upload middleware
- `backend/routes/auth.js` - Debug and fix company registration

**Frontend:**
- `Ai_Nexus/src/context/AuthContext.jsx` - NEW: Auth state management
- `Ai_Nexus/src/components/ProtectedRoute.jsx` - NEW: Route protection
- `Ai_Nexus/src/pages/Dashboard/UserDashboard.jsx` - NEW: User dashboard
- `Ai_Nexus/src/pages/Dashboard/CompanyDashboard.jsx` - NEW: Company dashboard
- `Ai_Nexus/src/pages/Dashboard/Dashboard.jsx` - Update to handle routing
- `Ai_Nexus/src/components/Header.jsx` - Update for auth-based UI
- `Ai_Nexus/src/pages/Login/Login.jsx` - Update to use AuthContext
- `Ai_Nexus/src/pages/Register/Register.jsx` - Update to use AuthContext
- `Ai_Nexus/src/App.jsx` - Add routing and protected routes

## Success Criteria:
✅ Company registration works without 500 error
✅ User registration works
✅ Login works for both users and companies
✅ Proper JWT token handling
✅ Role-based dashboard redirection
✅ Auth-based UI (show/hide buttons)
✅ Protected routes working
✅ Dashboard loads real data from API
