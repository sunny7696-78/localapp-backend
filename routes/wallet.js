const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id });
    res.json(wallet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/add-points', protect, async (req, res) => {
  try {
    const { points, description } = req.body;
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id });
    wallet.loyaltyPoints += points;
    wallet.transactions.push({ type: 'credit', amount: points, description: description || 'Loyalty points earned' });
    await wallet.save();
    res.json(wallet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
