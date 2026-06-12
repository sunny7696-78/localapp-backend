const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  mrp: Number,
  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'dairy', 'snacks', 'beverages', 'grains', 'personal_care', 'household', 'other'],
    required: true
  },
  image: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: 'piece' }, // kg, litre, piece, pack
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAvailable: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
