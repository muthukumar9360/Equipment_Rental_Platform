const Event = require('../models/Event');

// @desc    Get user events/notifications
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark event as read
// @route   PUT /api/events/:id/read
const markAsRead = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    event.readStatus = true;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, markAsRead };
