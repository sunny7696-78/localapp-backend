const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

const messageSchema = new mongoose.Schema({
  room: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String,
  senderRole: String,
  message: String,
  orderId: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

router.get('/:roomId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:roomId', protect, async (req, res) => {
  try {
    const msg = await Message.create({
      room: req.params.roomId,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: req.body.message,
      orderId: req.body.orderId
    });
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
