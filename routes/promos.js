const express = require('express');
const router = express.Router();
const Promo = require('../models/Promo');
const { protect, adminOnly } = require('../middleware/auth');

// Apply promo code
router.post('/apply', protect, async (req, res) => {
  try {
    const { code, orderTotal, orderType } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) return res.status(404).json({ message: 'Invalid promo code' });
    if (new Date() > promo.validTill) return res.status(400).json({ message: 'Promo code expired' });
    if (promo.usedCount >= promo.usageLimit) return res.status(400).json({ message: 'Promo limit reached' });
    if (orderTotal < promo.minOrder) return res.status(400).json({ message: `Min order Rs ${promo.minOrder} required` });
    if (promo.applicableOn !== 'all' && promo.applicableOn !== orderType) return res.status(400).json({ message: `Code only for ${promo.applicableOn} orders` });
    let discount = promo.discountType === 'percent' ? Math.round(orderTotal * promo.discountValue / 100) : promo.discountValue;
    discount = Math.min(discount, promo.maxDiscount);
    res.json({ valid: true, discount, code: promo.code, description: promo.description });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: get all promos
router.get('/', protect, adminOnly, async (req, res) => {
  try { const promos = await Promo.find().sort({ createdAt: -1 }); res.json(promos); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: create promo
router.post('/', protect, adminOnly, async (req, res) => {
  try { const promo = await Promo.create(req.body); res.status(201).json(promo); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: toggle promo
router.put('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const promo = await Promo.findById(req.params.id);
    promo.isActive = !promo.isActive;
    await promo.save();
    res.json(promo);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: delete promo
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Promo.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
