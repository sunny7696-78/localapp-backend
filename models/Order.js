const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['grocery', 'food'], required: true },
  items: [orderItemSchema],
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }, // for food orders
  deliveryAddress: {
    street: String,
    area: String,
    city: String,
    lat: Number,
    lng: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subtotal: Number,
  deliveryFee: { type: Number, default: 20 },
  discount: { type: Number, default: 0 },
  total: Number,
  commissionRate: { type: Number, default: 0 },
  platformCommission: { type: Number, default: 0 },
  vendorPayout: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  razorpayPaymentId: String,
  estimatedTime: String,
  otp: String, // delivery OTP
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
