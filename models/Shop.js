const mongoose = require('mongoose');
const shopSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['kirana', 'pharmacy', 'bakery', 'electronics', 'clothing', 'other'], default: 'kirana' },
  address: { street: String, area: String, city: { type: String, default: 'Ludhiana' }, pincode: String },
  phone: String,
  image: String,
  isOpen: { type: Boolean, default: true },
  openTime: { type: String, default: '09:00' },
  closeTime: { type: String, default: '21:00' },
  deliveryRadius: { type: Number, default: 5 },
  minOrder: { type: Number, default: 100 },
  deliveryFee: { type: Number, default: 20 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Shop', shopSchema);
