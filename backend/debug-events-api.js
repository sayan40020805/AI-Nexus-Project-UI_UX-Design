const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://ssayanmjhi410_db_user:sayan@cluster0.xhcjuix.mongodb.net/?appName=Cluster0');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Event Model
const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  time: String,
  location: String,
  eventType: String,
  isPublic: { type: Boolean, default: true },
  status: { type: String, default: 'published' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  image: String,
  tags: [String],
  likes: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  comments: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    content: String, 
    createdAt: Date 
  }],
  views: { type: Number, default: 0 },
  maxAttendees: Number,
  currentAttendees: { type: Number, default: 0 },
  registrationRequired: { type: Boolean, default: false },
  registrationDeadline: Date,
  isVirtual: { type: Boolean, default: false },
  meetingLink: String,
  meetingPassword: String,
  streamingUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', EventSchema);

async function testEventsAPI() {
  try {
    console.log('Testing Events API...');
    
    // Connect to database
    await connectDB();
    
    // Test basic query
    console.log('\n1. Testing basic event count...');
    const totalCount = await Event.countDocuments();
    console.log(`Total events in database: ${totalCount}`);
    
    // Test published events
    console.log('\n2. Testing published events count...');
    const publishedCount = await Event.countDocuments({ status: 'published' });
    console.log(`Published events: ${publishedCount}`);
    
    // Test public events
    console.log('\n3. Testing public events count...');
    const publicCount = await Event.countDocuments({ isPublic: true });
    console.log(`Public events: ${publicCount}`);
    
    // Test combined filter (same as API)
    console.log('\n4. Testing combined filter...');
    const filter = { 
      isPublic: true,
      status: 'published'
    };
    const combinedCount = await Event.countDocuments(filter);
    console.log(`Combined filter events: ${combinedCount}`);
    
    // Test actual query with populate
    console.log('\n5. Testing query with populate...');
    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      .populate('likes.user', 'firstName lastName')
      .limit(5)
      .lean();
    
    console.log(`Found ${events.length} events`);
    
    if (events.length > 0) {
      console.log('Sample event:', {
        id: events[0]._id,
        title: events[0].title,
        eventType: events[0].eventType,
        isPublic: events[0].isPublic,
        status: events[0].status
      });
    }
    
    console.log('\n✅ Events API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Events API test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

// Run the test
testEventsAPI();
