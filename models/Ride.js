const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleType: { type: String, enum: ['bike', 'auto', 'car'], required: true },
  pickup: {
    address: String,
    area: String,
    lat: Number,
    lng: Number,
  },
  drop: {
    address: String,
    area: String,
    lat: Number,
    lng: Number,
  },
  status: {
    type: String,
    enum: ['searching', 'accepted', 'arrived', 'started', 'completed', 'cancelled'],
    default: 'searching'
  },
  fare: Number,
  distance: Number, // in km
  duration: Number, // in minutes
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  razorpayPaymentId: String,
  otp: String,
  rating: Number,
  review: String,
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
