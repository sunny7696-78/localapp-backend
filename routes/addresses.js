const express = require('express');
const router = express.Router();
const SavedAddress = require('../models/SavedAddress');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try { const addresses = await SavedAddress.find({ user: req.user._id }); res.json(addresses); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    if (req.body.isDefault) await SavedAddress.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await SavedAddress.create({ ...req.body, user: req.user._id });
    res.status(201).json(address);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    if (req.body.isDefault) await SavedAddress.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await SavedAddress.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(address);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try { await SavedAddress.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
