const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { authMiddleware } = require('../middleware/auth');

// POST /api/events/:eventId/register - Register for an event
router.post('/:eventId/register', authMiddleware, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      dietaryRestrictions,
      accessibilityNeeds,
      additionalNotes,
      customFields
    } = req.body;
    
    // Check if event exists and is open for registration
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.isRegistrationOpen()) {
      return res.status(400).json({ 
        message: 'Registration is not open for this event' 
      });
    }
    
    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({
      event: req.params.eventId,
      user: req.user.id
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'You are already registered for this event' 
      });
    }
    
    // Check if event is full
    if (event.isFull()) {
      return res.status(400).json({ 
        message: 'This event is full. You have been added to the waitlist.' 
      });
    }
    
    // Create registration
    const registrationData = {
      event: req.params.eventId,
      user: req.user.id,
      status: event.isFull() ? 'waitlisted' : 'confirmed',
      firstName: firstName ? firstName.trim() : undefined,
      lastName: lastName ? lastName.trim() : undefined,
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      company: company ? company.trim() : undefined,
      jobTitle: jobTitle ? jobTitle.trim() : undefined,
      dietaryRestrictions: dietaryRestrictions ? dietaryRestrictions.trim() : undefined,
      accessibilityNeeds: accessibilityNeeds ? accessibilityNeeds.trim() : undefined,
      additionalNotes: additionalNotes ? additionalNotes.trim() : undefined
    };
    
    // Handle custom fields
    if (customFields && Array.isArray(customFields)) {
      registrationData.customFields = customFields.map(field => ({
        question: field.question,
        answer: field.answer
      }));
    }
    
    const registration = new EventRegistration(registrationData);
    await registration.save();
    
    // Update event's current attendee count
    const confirmedCount = await EventRegistration.countDocuments({
      event: req.params.eventId,
      status: 'confirmed'
    });
    
    event.currentAttendees = confirmedCount;
    await event.save();
    
    // Populate and return registration with event details
    await registration.populate([
      { path: 'event', select: 'title date time location' },
      { path: 'user', select: 'firstName lastName email' }
    ]);
    
    res.status(201).json({
      message: 'Successfully registered for event',
      registration
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/events/:eventId/registrations - Get event registrations (organizer only)
router.get('/:eventId/registrations', authMiddleware, async (req, res) => {
  try {
    // Check if user is the event organizer
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view registrations' });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = { event: req.params.eventId };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const registrations = await EventRegistration.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await EventRegistration.countDocuments(filter);
    
    // Get registration stats
    const stats = await EventRegistration.getEventStats(req.params.eventId);
    
    res.json({
      registrations,
      stats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/events/user/registrations - Get user's event registrations
router.get('/user/registrations', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const registrations = await EventRegistration.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title date time location category status maxAttendees currentAttendees',
        match: { isPublic: true }
      })
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // Filter out registrations where event is null (due to isPublic filter)
    const validRegistrations = registrations.filter(reg => reg.event !== null);
    
    const total = await EventRegistration.countDocuments({ user: req.user.id });
    
    res.json({
      registrations: validRegistrations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/events/:eventId/registrations/:registrationId - Update registration status
router.put('/:eventId/registrations/:registrationId', authMiddleware, async (req, res) => {
  try {
    // Check if user is the event organizer
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update registration' });
    }
    
    const { status, paymentStatus } = req.body;
    
    const registration = await EventRegistration.findById(req.params.registrationId);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Update status
    if (status) {
      registration.status = status;
    }
    
    if (paymentStatus) {
      registration.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        registration.paymentDate = new Date();
      }
    }
    
    await registration.save();
    
    // Update event attendee count if status changed to/from confirmed
    if (status === 'confirmed' || registration.status === 'confirmed') {
      const confirmedCount = await EventRegistration.countDocuments({
        event: req.params.eventId,
        status: 'confirmed'
      });
      
      event.currentAttendees = confirmedCount;
      await event.save();
    }
    
    await registration.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'event', select: 'title date time location' }
    ]);
    
    res.json({
      message: 'Registration updated successfully',
      registration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/events/:eventId/register - Unregister from event
router.delete('/:eventId/register', authMiddleware, async (req, res) => {
  try {
    const registration = await EventRegistration.findOne({
      event: req.params.eventId,
      user: req.user.id
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Update registration status to cancelled instead of deleting
    registration.status = 'cancelled';
    await registration.save();
    
    // Update event's current attendee count
    const event = await Event.findById(req.params.eventId);
    const confirmedCount = await EventRegistration.countDocuments({
      event: req.params.eventId,
      status: 'confirmed'
    });
    
    event.currentAttendees = confirmedCount;
    await event.save();
    
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:eventId/registrations/:registrationId/checkin - Check-in attendee
router.put('/:eventId/registrations/:registrationId/checkin', authMiddleware, async (req, res) => {
  try {
    // Check if user is the event organizer
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to check-in attendees' });
    }
    
    const registration = await EventRegistration.findById(req.params.registrationId);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    registration.checkedIn = true;
    registration.checkInTime = new Date();
    
    await registration.save();
    
    res.json({
      message: 'Attendee checked in successfully',
      registration
    });
  } catch (error) {
    console.error('Error checking in attendee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:eventId/registrations/:registrationId/feedback - Submit event feedback
router.post('/:eventId/registrations/:registrationId/feedback', authMiddleware, async (req, res) => {
  try {
    const { rating, comments } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const registration = await EventRegistration.findOne({
      _id: req.params.registrationId,
      user: req.user.id,
      event: req.params.eventId
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if event has already passed
    const event = await Event.findById(req.params.eventId);
    if (!event || event.date > new Date()) {
      return res.status(400).json({ message: 'Feedback can only be submitted after the event' });
    }
    
    registration.feedback = {
      rating,
      comments: comments ? comments.trim() : undefined,
      submittedAt: new Date()
    };
    
    await registration.save();
    
    res.json({
      message: 'Feedback submitted successfully',
      feedback: registration.feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/events/:eventId/stats - Get event registration statistics
router.get('/:eventId/stats', authMiddleware, async (req, res) => {
  try {
    // Check if user is the event organizer
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view event stats' });
    }
    
    const stats = await EventRegistration.getEventStats(req.params.eventId);
    
    // Add additional statistics
    const recentRegistrations = await EventRegistration.countDocuments({
      event: req.params.eventId,
      registrationDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    stats.recentRegistrations = recentRegistrations;
    stats.checkInRate = stats.confirmed > 0 ? 
      Math.round((stats.attended / stats.confirmed) * 100) : 0;
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
