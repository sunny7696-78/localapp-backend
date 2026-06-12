const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String, // starter, main course, dessert, drinks
  image: String,
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cuisine: [String],
  address: {
    street: String,
    area: String,
    city: { type: String, default: 'Ludhiana' },
  },
  phone: String,
  image: String,
  rating: { type: Number, default: 0 },
  deliveryTime: { type: String, default: '30-45 min' },
  deliveryFee: { type: Number, default: 20 },
  minOrder: { type: Number, default: 100 },
  isOpen: { type: Boolean, default: true },
  menu: [menuItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
