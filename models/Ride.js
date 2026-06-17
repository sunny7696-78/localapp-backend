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
  commissionRate: { type: Number, default: 0 }, // % jo LocalApp ne kaata
  platformCommission: { type: Number, default: 0 }, // ₹ amount jo LocalApp ka profit hai
  driverPayout: { type: Number, default: 0 }, // ₹ amount jo driver ko milega
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  otp: String,
  rating: Number,
  review: String,
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
