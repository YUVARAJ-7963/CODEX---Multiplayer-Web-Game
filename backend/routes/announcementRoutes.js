const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { authenticateAdmin } = require('../middleware/auth');

// Get all announcements
router.get('/getall', async (req, res) => {
  try {
    console.log('Fetching announcements...');
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    console.log('Found announcements:', announcements.length);
    res.json(announcements);
  } catch (error) {
    console.error('Error in GET /api/announcements:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new announcement (admin only)
router.post('/create', async (req, res) => {
  try {
    console.log('Creating new announcement:', req.body);
    const announcement = new Announcement({
      title: req.body.title,
      message: req.body.message, 
      priority: req.body.priority
    });
    const newAnnouncement = await announcement.save();
    console.log('Announcement created:', newAnnouncement);
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('Error in POST /api/announcements:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update announcement (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('Updating announcement:', req.params.id);
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    announcement.title = req.body.title || announcement.title;
    announcement.message = req.body.message || announcement.message;
    announcement.priority = req.body.priority || announcement.priority;
    
    const updatedAnnouncement = await announcement.save();
    console.log('Announcement updated:', updatedAnnouncement);
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error in PUT /api/announcements/:id:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete announcement (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('Deleting announcement:', req.params.id);
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    await announcement.deleteOne();
    console.log('Announcement deleted successfully');
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/announcements/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 