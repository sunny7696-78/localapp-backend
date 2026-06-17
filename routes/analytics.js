const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const last7 = new Date(now - 7 * 86400000);
    const last30 = new Date(now - 30 * 86400000);

    const [totalOrders, totalRides, totalUsers, revenueData, dailyOrders] = await Promise.all([
      Order.countDocuments(),
      Ride.countDocuments(),
      User.countDocuments(),
      Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: last7 } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const weekOrders = await Order.countDocuments({ createdAt: { $gte: last7 } });
    const monthOrders = await Order.countDocuments({ createdAt: { $gte: last30 } });
    const weekRevenue = await Order.aggregate([{ $match: { status: 'delivered', createdAt: { $gte: last7 } } }, { $group: { _id: null, total: { $sum: '$total' } } }]);

    res.json({
      totalOrders, totalRides, totalUsers,
      totalRevenue: revenueData[0]?.total || 0,
      weekOrders, monthOrders,
      weekRevenue: weekRevenue[0]?.total || 0,
      dailyOrders
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/vendor', protect, async (req, res) => {
  try {
    const last7 = new Date(Date.now() - 7 * 86400000);
    const orders = await Order.find({ status: 'delivered', createdAt: { $gte: last7 } });
    const daily = {};
    orders.forEach(o => {
      const day = o.createdAt.toISOString().split('T')[0];
      if (!daily[day]) daily[day] = { orders: 0, revenue: 0 };
      daily[day].orders++;
      daily[day].revenue += o.total;
    });
    res.json({ daily, totalOrders: orders.length, totalRevenue: orders.reduce((s, o) => s + o.total, 0) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
