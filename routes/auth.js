const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role, vehicle } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });

    const user = await User.create({ name, phone, email, password, role: role || 'customer', vehicle });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid phone or password' });

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      address: user.address,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email, address } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    if (!phone || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Phone aur kam se kam 6 character ka password chahiye' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User nahi mila' });
    user.password = newPassword; // pre-save hook hashes it
    await user.save();
    res.json({ message: 'Password reset ho gaya' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
