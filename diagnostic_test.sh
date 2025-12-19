#!/bin/bash

echo "=== AI NEXUS DIAGNOSTIC TEST ==="
echo "Testing all components of the application..."
echo ""

# Test 1: Check if backend is responding
echo "1. Testing Backend Health Check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Backend is running and healthy"
    curl -s http://localhost:5001/health
    echo ""
else
    echo "❌ Backend is not responding (HTTP $HEALTH_RESPONSE)"
    echo "Starting backend server..."
    cd /workspaces/AI-Nexus-Project-UI_UX-Design/backend && node server.js &
    sleep 3
fi
echo ""

# Test 2: Check frontend accessibility
echo "2. Testing Frontend Accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174 2>/dev/null)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend is accessible (HTTP $FRONTEND_RESPONSE)"
else
    echo "❌ Frontend is not accessible (HTTP $FRONTEND_RESPONSE)"
    echo "Starting frontend server..."
    cd /workspaces/AI-Nexus-Project-UI_UX-Design/Ai_Nexus && npm run dev &
    sleep 5
fi
echo ""

# Test 3: Direct API test
echo "3. Testing Direct Backend API..."
echo "Testing signup endpoint..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "username": "diagnostic_test", "email": "diagnostic@test.com", "password": "DiagnosticTest123"}' \
  --max-time 10)

if echo "$SIGNUP_RESPONSE" | grep -q '"token"'; then
    echo "✅ Direct API test successful"
    echo "Response: $(echo "$SIGNUP_RESPONSE" | head -c 200)..."
else
    echo "❌ Direct API test failed"
    echo "Response: $SIGNUP_RESPONSE"
fi
echo ""

# Test 4: Frontend proxy test
echo "4. Testing Frontend Proxy..."
echo "Testing signup via frontend proxy..."
PROXY_RESPONSE=$(curl -s -X POST http://localhost:5174/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "username": "proxy_test", "email": "proxy@test.com", "password": "ProxyTest123"}' \
  --max-time 10)

if echo "$PROXY_RESPONSE" | grep -q '"token"'; then
    echo "✅ Frontend proxy test successful"
    echo "Response: $(echo "$PROXY_RESPONSE" | head -c 200)..."
else
    echo "❌ Frontend proxy test failed"
    echo "Response: $PROXY_RESPONSE"
fi
echo ""

# Test 5: Check process status
echo "5. Process Status Check..."
echo "Node.js processes:"
ps aux | grep node | grep -v grep
echo ""

# Test 6: Check ports
echo "6. Port Status Check..."
echo "Backend port 5001:"
netstat -tulpn 2>/dev/null | grep :5001 || echo "Port 5001 not in use"
echo "Frontend port 5174:"
netstat -tulpn 2>/dev/null | grep :5174 || echo "Port 5174 not in use"
echo ""

echo "=== DIAGNOSTIC COMPLETE ==="
echo ""
echo "If you see ✅ marks for all tests, the application is working."
echo "If you see ❌ marks, note which test failed and check the corresponding logs."
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5174 in your browser"
echo "2. Navigate to the Register page"
echo "3. Check browser console for any errors (F12 → Console)"
echo "4. Test the registration form"
echo ""
echo "If still having issues, copy the exact error message from browser console."
