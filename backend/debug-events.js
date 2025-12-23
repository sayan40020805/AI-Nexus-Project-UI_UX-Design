
const mongoose = require('mongoose');
const Event = require('./models/Event');

const MONGODB_URI = "mongodb://localhost:27017/ainexus";

async function runTest() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected.');

    console.log('Fetching events...');
    const filter = { 
      isPublic: true,
      status: 'published'
    };
    
    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      // .populate('likes.user', 'firstName lastName')
      .sort({ date: 1 })
      .skip(0)
      .limit(10);

    console.log('Events fetched successfully.');
    console.log('Number of events:', events.length);

    console.log('Trying to populate likes.user on fetched events...');
    for (const event of events) {
      try {
        await event.populate('likes.user', 'firstName lastName');
      } catch (e) {
        console.error('Error populating likes.user for event:', event._id);
        console.error(e);
      }
    }
    console.log('Finished populating likes.user.');


  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

runTest();
