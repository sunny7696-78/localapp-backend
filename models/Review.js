const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['restaurant', 'product', 'driver'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });
module.exports = mongoose.model('Review', reviewSchema);
