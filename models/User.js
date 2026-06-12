const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'driver', 'vendor', 'admin'], default: 'customer' },
  address: {
    street: String,
    area: String,
    city: { type: String, default: 'Ludhiana' },
    pincode: String,
    lat: Number,
    lng: Number,
  },
  profilePic: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  // Driver specific
  vehicle: {
    type: { type: String, enum: ['bike', 'auto', 'car'] },
    number: String,
    model: String,
  },
  isAvailable: { type: Boolean, default: false }, // for drivers
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
