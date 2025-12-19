#!/bin/bash

echo "=== EMERGENCY BROWSER FIX ==="
echo "Fixing common browser issues..."
echo ""

# Kill existing processes
echo "1. Killing all Node processes..."
pkill -f node
sleep 2

# Start backend fresh
echo "2. Starting backend server..."
cd /workspaces/AI-Nexus-Project-UI_UX-Design/backend
node server.js > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Start frontend fresh  
echo "3. Starting frontend server..."
cd /workspaces/AI-Nexus-Project-UI_UX-Design/Ai_Nexus
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 5

# Test the services
echo "4. Testing services..."
curl -s http://localhost:5001/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend started successfully (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start"
fi

curl -s http://localhost:5174 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend started successfully (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "=== BROWSER FIX COMPLETE ==="
echo ""
echo "PIDs:"
echo "Backend: $BACKEND_PID"  
echo "Frontend: $FRONTEND_PID"
echo ""
echo "Services running:"
echo "- Backend: http://localhost:5001"
echo "- Frontend: http://localhost:5174"
echo ""
echo "NEXT STEPS:"
echo "1. Open http://localhost:5174 in a FRESH browser (Chrome recommended)"
echo "2. If using Chrome: Settings → Privacy and security → Clear browsing data → All time"
echo "3. Disable ALL browser extensions temporarily"
echo "4. Try the registration form"
echo ""
echo "Logs saved:"
echo "- Backend: /workspaces/AI-Nexus-Project-UI_UX-Design/backend/backend.log"
echo "- Frontend: /workspaces/AI-Nexus-Project-UI_UX-Design/Ai_Nexus/frontend.log"
