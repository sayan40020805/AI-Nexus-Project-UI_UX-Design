// Test script to validate the Event and EventRegistration models and routes
console.log('Testing Event model...');
try {
  const Event = require('./models/Event');
  console.log('✓ Event model loaded successfully');
} catch (error) {
  console.error('✗ Event model error:', error.message);
}

console.log('\nTesting EventRegistration model...');
try {
  const EventRegistration = require('./models/EventRegistration');
  console.log('✓ EventRegistration model loaded successfully');
} catch (error) {
  console.error('✗ EventRegistration model error:', error.message);
}

console.log('\nTesting events route...');
try {
  const eventsRouter = require('./routes/events');
  console.log('✓ Events route loaded successfully');
} catch (error) {
  console.error('✗ Events route error:', error.message);
}

console.log('\nTesting eventRegistrations route...');
try {
  const eventRegistrationsRouter = require('./routes/eventRegistrations');
  console.log('✓ EventRegistrations route loaded successfully');
} catch (error) {
  console.error('✗ EventRegistrations route error:', error.message);
}

console.log('\nTest completed.');
