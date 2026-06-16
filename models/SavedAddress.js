const mongoose = require('mongoose');
const savedAddressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
  street: String,
  area: String,
  city: { type: String, default: 'Ludhiana' },
  pincode: String,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('SavedAddress', savedAddressSchema);
