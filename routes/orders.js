const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, driverOnly } = require('../middleware/auth');

// @POST /api/orders - place order
router.post('/', protect, async (req, res) => {
  try {
    const { type, items, deliveryAddress, restaurantId, paymentMethod, paymentStatus, notes, discount } = req.body;
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= 299 ? 0 : 20;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const finalDiscount = discount || 0;

    const order = await Order.create({
      user: req.user._id,
      type,
      items,
      restaurant: restaurantId,
      deliveryAddress,
      subtotal,
      deliveryFee,
      discount: finalDiscount,
      total: subtotal + deliveryFee - finalDiscount,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'online' && paymentStatus === 'paid' ? 'paid' : 'pending',
      otp,
      notes,
      estimatedTime: type === 'food' ? '30-45 min' : '15-20 min',
    });
    res.status(201).json({ ...order._doc, otp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/orders/my - get user's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('driver', 'name phone vehicle');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/orders/available - for drivers to see pending orders
router.get('/available', protect, driverOnly, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' })
      .populate('user', 'name phone address')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('driver', 'name phone vehicle');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/orders/:id/status - update order status (driver/admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (status === 'accepted' && req.user.role === 'driver') {
      order.driver = req.user._id;
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order' });
    if (['picked_up', 'delivered'].includes(order.status))
      return res.status(400).json({ message: 'Cannot cancel now' });
    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
