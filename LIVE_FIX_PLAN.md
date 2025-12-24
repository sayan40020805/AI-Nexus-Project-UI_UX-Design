# Live Streaming Fix Plan

## Issues Found
1. **API Endpoint Mismatch**: Frontend calls `/api/live/active` and `/api/live/upcoming` but backend only has `/` route
2. **Backend Port Conflict**: Port 5001 already in use
3. **Missing Error Handling**: Frontend doesn't handle API failures gracefully
4. **Route Parameter Handling**: Frontend passes `?action=start` but doesn't handle it

## Fix Steps
1. **Update Backend Routes**: Add `/active` and `/upcoming` endpoints to match frontend calls
2. **Fix Frontend API Calls**: Update Live.jsx to use correct endpoints
3. **Add Better Error Handling**: Show loading states and error messages
4. **Handle Action Parameter**: Process `?action=start` for auto-creating sessions
5. **Kill Existing Process**: Stop existing backend process on port 5001

## Expected Result
- "Go Live" button should show live streams page with content
- Company users can create new live sessions
- Users can view and join live sessions
- Proper error handling and loading states
