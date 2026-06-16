const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { targetType, targetId, rating, comment, orderId } = req.body;
    const existing = await Review.findOne({ user: req.user._id, targetId, orderId });
    if (existing) return res.status(400).json({ message: 'Already reviewed' });
    const review = await Review.create({ user: req.user._id, targetType, targetId, rating, comment, orderId });
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const reviews = await Review.find({ targetType: req.params.targetType, targetId: req.params.targetId })
      .populate('user', 'name').sort({ createdAt: -1 });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ reviews, average: avg.toFixed(1), total: reviews.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
