# Complete Troubleshooting Guide

## Step 1: Verify All Services Are Running

### Check Backend Server
```bash
curl -s http://localhost:5001/health
```
**Expected Response:**
```json
{"status":"OK","timestamp":"2025-12-19T..."}
```

### Check Frontend Server
```bash
curl -s http://localhost:5174
```
**Expected Response:** HTML content (not an error)

## Step 2: Test API Endpoints Directly

### Test Signup Endpoint
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "username": "testuser123", "email": "test123@example.com", "password": "TestPass123"}'
```

### Test Frontend Proxy
```bash
curl -X POST http://localhost:5174/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "username": "testuser123", "email": "test123@example.com", "password": "TestPass123"}'
```

**Expected Response:** JSON with `token` and `user` fields

## Step 3: Check Server Logs

### Backend Logs
Look for server output showing:
- "Server started on port 5001"
- "MongoDB Connected: ac-nxn5qqk-shard-00-00.cg391uu.mongodb.net"
- Request logs with 201 status codes

### Frontend Logs
Look for Vite output showing:
- "ready in 200 ms"
- "Local: http://localhost:5174/"

## Step 4: Browser Console Errors

### Common Issues:
1. **CORS Errors**: Check if backend CORS allows frontend origin
2. **Network Errors**: Check if ports are accessible
3. **JavaScript Errors**: Check React component errors

### How to Check:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Go to Network tab to see API request status

## Step 5: Test Different Scenarios

### Test Without File Upload
The React form uses FormData for file uploads. Test the basic JSON API first:

```bash
curl -X POST http://localhost:5174/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "username": "testuser456", "email": "test456@example.com", "password": "TestPass456"}'
```

### Test Login
```bash
curl -X POST http://localhost:5174/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test456@example.com", "password": "TestPass456"}'
```

## Step 6: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

## Step 7: Check Environment Variables

### Backend (.env file)
```
MONGODB_URI=mongodb+srv://ssayanmjhi204:sayan@cluster0.cg391uu.mongodb.net/AI_Nexus
JWT_SECRET=your_jwt_secret_here
PORT=5001
```

### Frontend (no special env vars needed)

## Step 8: Check File Permissions

```bash
# Check if uploads directory exists and is writable
ls -la /workspaces/AI-Nexus-Project-UI_UX-Design/backend/uploads/
```

## Step 9: Test with Different Browsers

Try the same URL in:
- Chrome
- Firefox  
- Edge
- Private/Incognito mode

## Step 10: Check for Port Conflicts

```bash
# Check what's running on ports 5001 and 5174
netstat -tulpn | grep :5001
netstat -tulpn | grep :5174
```

## Emergency Reset Steps

If nothing works, try this complete reset:

### 1. Kill All Node Processes
```bash
pkill -f node
```

### 2. Start Backend Fresh
```bash
cd /workspaces/AI-Nexus-Project-UI_UX-Design/backend
npm install
node server.js
```

### 3. Start Frontend Fresh  
```bash
cd /workspaces/AI-Nexus-Project-UI_UX-Design/Ai_Nexus
npm install
npm run dev
```

### 4. Test Immediately
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "username": "emergencytest", "email": "emergency@test.com", "password": "EmergencyTest123"}'
```

## Still Having Issues?

If you still see errors after following all steps:

1. **Copy the exact error message** from browser console
2. **Copy the network request status** from browser DevTools Network tab
3. **Note which browser and version** you're using
4. **Check if you're behind a corporate firewall** that might block ports

The backend is definitely working (we see 201 responses), so the issue is likely:
- Frontend configuration
- Browser cache
- Network connectivity
- CORS settings
