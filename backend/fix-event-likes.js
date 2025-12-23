
const mongoose = require('mongoose');
const Event = require('./models/Event');

const MONGODB_URI = "mongodb://localhost:27017/ainexus";

async function fixEventLikes() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected.');

    console.log('Finding events with potentially bad likes data...');
    const events = await Event.find({ 'likes.user': null });

    if (events.length === 0) {
      console.log('No events found with null users in likes. The data seems clean.');
      return;
    }

    console.log(`Found ${events.length} events with null users in likes.`);

    for (const event of events) {
      const originalLikesCount = event.likes.length;
      event.likes = event.likes.filter(like => like.user);
      const newLikesCount = event.likes.length;

      if (originalLikesCount !== newLikesCount) {
        console.log(`Fixing event ${event._id}. Removed ${originalLikesCount - newLikesCount} likes with null users.`);
        await event.save();
      }
    }

    console.log('Finished cleaning event likes.');

  } catch (error) {
    console.error('An error occurred during the fix process:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

fixEventLikes();
