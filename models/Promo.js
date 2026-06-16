const mongoose = require('mongoose');
const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percent', 'flat'], default: 'percent' },
  discountValue: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 500 },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, default: Date.now },
  validTill: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  applicableOn: { type: String, enum: ['all', 'grocery', 'food', 'ride'], default: 'all' },
}, { timestamps: true });
module.exports = mongoose.model('Promo', promoSchema);
