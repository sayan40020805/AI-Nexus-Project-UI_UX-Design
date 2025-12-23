const express = require('express');
const cors = require('cors');
const Event = require('./backend/models/Event');

// Simple test to identify the issue
async function testEventsAPI() {
  try {
    console.log('Testing Events API...');
    
    // Simulate the exact same query as in the events.js route
    const filter = { 
      isPublic: true,
      status: 'published'
    };
    
    console.log('Filter:', filter);
    
    // Try to find events
    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      .populate('likes.user', 'firstName lastName')
      .sort({ date: 1 })
      .limit(10);
    
    console.log('Events found:', events.length);
    console.log('Events:', events.map(e => ({ _id: e._id, title: e.title, status: e.status })));
    
  } catch (error) {
    console.error('Error in Events API test:', error);
    console.error('Stack:', error.stack);
  }
}

// Start a simple test server
const app = express();
app.use(cors());

app.get('/test-events', async (req, res) => {
  try {
    console.log('Test endpoint called');
    await testEventsAPI();
    res.json({ message: 'Test completed' });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log('Testing events API...');
  testEventsAPI();
});
