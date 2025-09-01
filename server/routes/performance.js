const express = require('express');
const Performance = require('../models/Performance');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all performances (admin) or user's performances (vendeur)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is vendeur, only show their performances
    if (req.user.role === 'vendeur') {
      query.seller = req.user._id;
    }

    const performances = await Performance.find(query)
      .populate('seller', 'name')
      .sort({ date: -1 });
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new performance
router.post('/', auth, authorize('admin', 'vendeur'), async (req, res) => {
  try {
    const {
      sellerName,
      date,
      messagesSent,
      callsMade,
      ordersGenerated,
      revenue
    } = req.body;

    // Check if performance already exists for this seller and date
    const existingPerformance = await Performance.findOne({
      seller: req.user._id,
      date: new Date(date)
    });

    if (existingPerformance) {
      return res.status(400).json({ message: 'Performance already recorded for this date' });
    }

    const performance = new Performance({
      seller: req.user._id,
      sellerName: sellerName || req.user.name,
      date: new Date(date),
      messagesSent,
      callsMade,
      ordersGenerated: ordersGenerated || 0,
      revenue: revenue || 0
    });

    await performance.save();
    
    const populatedPerformance = await Performance.findById(performance._id)
      .populate('seller', 'name');
    
    res.status(201).json(populatedPerformance);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Performance already recorded for this date' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Update performance
router.put('/:id', auth, async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ message: 'Performance not found' });
    }

    // Check permissions
    if (req.user.role === 'vendeur' && performance.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedPerformance = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('seller', 'name');

    res.json(updatedPerformance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete performance
router.delete('/:id', auth, async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ message: 'Performance not found' });
    }

    // Check permissions
    if (req.user.role === 'vendeur' && performance.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Performance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Performance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;