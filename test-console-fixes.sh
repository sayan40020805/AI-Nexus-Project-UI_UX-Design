#!/bin/bash

echo "🔍 Testing Console Error Fixes"
echo "================================"

# Test 1: Health check
echo "1. Testing server health..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server not responding - start backend first"
    exit 1
fi

# Test 2: Events endpoint (main fix)
echo "2. Testing events endpoint (500 error fix)..."
EVENTS_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5001/api/events?status=published)
HTTP_CODE="${EVENTS_RESPONSE: -3}"
if [[ "$HTTP_CODE" == "200" ]]; then
    echo "   ✅ Events endpoint working (200 OK)"
    EVENTS_COUNT=$(echo "$EVENTS_RESPONSE" | grep -o '"events":\[[^]]*\]' | wc -l)
    echo "   📊 Events data received"
else
    echo "   ❌ Events endpoint failed (HTTP $HTTP_CODE)"
fi

# Test 3: CORS test
echo "3. Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -w "%{http_code}" -H "Origin: http://127.0.0.1:5173" -H "Access-Control-Request-Method: GET" -X OPTIONS http://localhost:5001/api/auth/me)
CORS_CODE="${CORS_RESPONSE: -3}"
if [[ "$CORS_CODE" == "200" ]] || [[ "$CORS_CODE" == "401" ]]; then
    echo "   ✅ CORS preflight working (HTTP $CORS_CODE)"
else
    echo "   ⚠️  CORS may still have issues (HTTP $CORS_CODE)"
fi

# Test 4: Rate limiting test
echo "4. Testing rate limiting behavior..."
for i in {1..5}; do
    RATE_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5001/api/auth/me)
    RATE_CODE="${RATE_RESPONSE: -3}"
    echo "   Request $i: HTTP $RATE_CODE"
    if [[ "$RATE_CODE" == "429" ]]; then
        echo "   ✅ Rate limiting active (expected behavior)"
        break
    fi
    sleep 0.1
done

echo ""
echo "🏁 Console Error Fix Test Complete"
echo "=================================="
echo ""
echo "Fixes Applied:"
echo "✅ Fixed events endpoint MongoDB query logic"
echo "✅ Enhanced CORS configuration with proper headers"
echo "✅ Improved Socket.IO CORS settings"
echo "✅ Reduced AuthContext verification frequency"
echo "✅ Enhanced EventService retry mechanism"
echo ""
echo "Next Steps:"
echo "1. Start backend server: cd backend && npm start"
echo "2. Start frontend: cd Ai_Nexus && npm run dev"
echo "3. Check browser console for remaining errors"
