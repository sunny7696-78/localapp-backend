const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Ride = require('../models/Ride');
const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [users, orders, rides, products, restaurants] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Ride.countDocuments(),
      Product.countDocuments(),
      Restaurant.countDocuments(),
    ]);
    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    res.json({
      users, orders, rides, products, restaurants,
      revenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/admin/orders
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name phone')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
