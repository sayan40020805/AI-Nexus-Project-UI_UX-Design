const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { authMiddleware, allowCompanyOnly, allowUserOrCompany } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Debug middleware: log incoming requests to events routes (helps diagnose 401s)
router.use((req, res, next) => {
  console.log('[Events Router] incoming', req.method, req.originalUrl, 'Authorization present:', !!req.headers.authorization);
  next();
});

// Simple ping endpoint to verify public access
router.get('/ping', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// GET /api/events - Get all public events (PUBLIC ENDPOINT - NO AUTH REQUIRED)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object with safe defaults
    const filter = { 
      isPublic: true,
      status: 'published'
    };
    
    // Handle status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Add date filter for upcoming events
    if (req.query.upcoming === 'true') {
      filter.date = { $gte: new Date() };
    }
    
    // Add category filter
    if (req.query.category) {
      filter.eventType = req.query.category;
    }
    
    // Add location filter
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Add search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
      
      // Add tags search if tags exist
      filter.$or.push({ tags: searchRegex });
    }
    
    console.log('Fetching events with filter:', JSON.stringify(filter, null, 2));
    
    // Get events with pagination and error handling
    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      .populate('likes.user', 'firstName lastName')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination
    const total = await Event.countDocuments(filter);
    
    console.log(`Found ${events.length} events out of ${total} total`);
    
    res.json({
      events,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      message: 'Failed to fetch events',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email')
      .populate('likes.user', 'firstName lastName')
      .populate('comments.user', 'firstName lastName');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Increment view count
    event.views += 1;
    await event.save();
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events - Create new event (Company Only)
router.post('/', authMiddleware, allowCompanyOnly, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      endTime,
      location,
      venue,
      eventType,
      tags,
      maxAttendees,
      registrationRequired,
      registrationDeadline,
      isVirtual,
      meetingLink,
      meetingPassword,
      streamingUrl,
      isPublic
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !time || !location || !eventType) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: title, description, date, time, location, eventType' 
      });
    }

    // Validate eventType - accept all event types from frontend
    const validEventTypes = ['Seminar', 'Hackathon', 'Quiz', 'Workshop', 'conference', 'networking', 'training', 'meetup', 'other'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        message: `Invalid event type. Must be one of: ${validEventTypes.join(', ')}`
      });
    }
    
    // Validate registration deadline is in the future
    const regDeadline = new Date(registrationDeadline);
    if (regDeadline <= new Date()) {
      return res.status(400).json({
        message: 'Registration deadline must be in the future'
      });
    }
    
    // Create event object
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      time: time.trim(),
      endTime: endTime ? endTime.trim() : undefined,
      location: location.trim(),
      organizer: req.user.id,
      eventType,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      registrationRequired: registrationRequired !== 'false',
      registrationDeadline: regDeadline,
      isVirtual: isVirtual === 'true',
      meetingLink: meetingLink ? meetingLink.trim() : undefined,
      meetingPassword: meetingPassword ? meetingPassword.trim() : undefined,
      streamingUrl: streamingUrl ? streamingUrl.trim() : undefined,
      isPublic: isPublic !== 'false',
      status: 'published' // Auto-publish for now
    };
    
    // Handle image upload
    if (req.file) {
      eventData.image = `/uploads/events/${req.file.filename}`;
    }
    
    const event = new Event(eventData);
    await event.save();
    
    // Populate organizer info before returning
    await event.populate('organizer', 'firstName lastName email');
    
    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', authMiddleware, allowCompanyOnly, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const updateData = { ...req.body };
    
    // Handle tags
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }
    
    // Handle dates
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.registrationDeadline) {
      updateData.registrationDeadline = new Date(updateData.registrationDeadline);
    }

    // Handle eventType validation - accept all event types from frontend
    if (updateData.eventType) {
      const validEventTypes = ['Seminar', 'Hackathon', 'Quiz', 'Workshop', 'conference', 'networking', 'training', 'meetup', 'other'];
      if (!validEventTypes.includes(updateData.eventType)) {
        return res.status(400).json({
          message: `Invalid event type. Must be one of: ${validEventTypes.join(', ')}`
        });
      }
    }
    
    // Handle image upload
    if (req.file) {
      updateData.image = `/uploads/events/${req.file.filename}`;
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email');
    
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    // Delete all registrations for this event
    await EventRegistration.deleteMany({ event: req.params.id });
    
    // Delete the event
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:id/like - Like/unlike event
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const userId = req.user.id;
    const likeIndex = event.likes.findIndex(like => like.user.toString() === userId);
    
    if (likeIndex > -1) {
      // Unlike
      event.likes.splice(likeIndex, 1);
      await event.save();
      
      res.json({ message: 'Event unliked', likes: event.likes.length });
    } else {
      // Like
      event.likes.push({ user: userId });
      await event.save();
      
      res.json({ message: 'Event liked', likes: event.likes.length });
    }
  } catch (error) {
    console.error('Error liking event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:id/comments - Add comment to event
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const comment = {
      user: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    };
    
    event.comments.push(comment);
    await event.save();
    
    // Populate the new comment
    await event.populate('comments.user', 'firstName lastName');
    const newComment = event.comments[event.comments.length - 1];
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/events/user/my-events - Get events created by user (Company Only)
router.get('/user/my-events', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .populate('organizer', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========================
// REGISTER FOR EVENT (User and Company)
// ========================
router.post('/:id/register', authMiddleware, allowUserOrCompany, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'firstName lastName');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is published and accepting registrations
    if (event.status !== 'published') {
      return res.status(400).json({ message: 'This event is not accepting registrations' });
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if event is full
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user has already registered
    const existingRegistration = await EventRegistration.findOne({
      event: event._id,
      user: req.user.id
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }

    // Create event registration
    const registration = new EventRegistration({
      event: event._id,
      user: req.user.id,
      status: 'pending',
      registrationDate: new Date()
    });

    await registration.save();

    // Update event attendee count
    await Event.findByIdAndUpdate(event._id, {
      $inc: { currentAttendees: 1 }
    });

    res.status(201).json({
      message: 'Registration submitted successfully',
      registration: {
        id: registration._id,
        eventTitle: event.title,
        eventType: event.eventType,
        status: registration.status,
        registrationDate: registration.registrationDate
      }
    });

  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error submitting registration' });
  }
});

// ========================
// GET EVENT PARTICIPANTS (Company Only, Own Events)
// ========================
router.get('/:id/participants', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view participants for this event' });
    }

    // Get all registrations for this event with user details
    const registrations = await EventRegistration.find({ event: event._id })
      .populate('user', 'username email profilePicture')
      .sort({ registrationDate: -1 });

    res.json({
      event: {
        id: event._id,
        title: event.title,
        eventType: event.eventType,
        currentAttendees: event.currentAttendees,
        maxAttendees: event.maxAttendees
      },
      registrations
    });

  } catch (error) {
    console.error('Error getting event participants:', error);
    res.status(500).json({ message: 'Server error getting event participants' });
  }
});

// ========================
// GET USER'S EVENT REGISTRATIONS (User and Company)
// ========================
router.get('/my/registrations', authMiddleware, allowUserOrCompany, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user: req.user.id })
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'companyName username profilePicture'
        }
      })
      .sort({ registrationDate: -1 });

    res.json({ registrations });

  } catch (error) {
    console.error('Error getting user registrations:', error);
    res.status(500).json({ message: 'Server error getting registrations' });
  }
});

// ========================
// CANCEL EVENT REGISTRATION (User and Company)
// ========================
router.delete('/:id/register', authMiddleware, allowUserOrCompany, async (req, res) => {
  try {
    const registration = await EventRegistration.findOne({
      event: req.params.id,
      user: req.user.id
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if registration can be cancelled (not already confirmed)
    if (registration.status === 'attended') {
      return res.status(400).json({ message: 'Cannot cancel registration after attending the event' });
    }

    // Delete the registration
    await EventRegistration.findByIdAndDelete(registration._id);

    // Update event attendee count
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { currentAttendees: -1 }
    });

    res.json({ message: 'Registration cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ message: 'Server error cancelling registration' });
  }
});

// GET /api/events/categories - Get all event types
router.get('/categories', async (req, res) => {
  try {
    const eventTypes = [
      'Seminar',
      'Hackathon',
      'Quiz',
      'Workshop',
      'conference',
      'networking',
      'training',
      'meetup',
      'other'
    ];
    
    res.json(eventTypes);
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
