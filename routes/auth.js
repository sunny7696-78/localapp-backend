const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Simple in-memory rate limiter — login/reset-password brute force se bachata hai
// Production scale pe Redis use karna better hai, abhi ke liye yeh kaafi hai
const attemptStore = {};
const checkRateLimit = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  if (!attemptStore[key]) attemptStore[key] = [];
  attemptStore[key] = attemptStore[key].filter(t => now - t < windowMs);
  if (attemptStore[key].length >= maxAttempts) return false;
  attemptStore[key].push(now);
  return true;
};

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role, vehicle } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ message: 'Name, phone aur password chahiye' });
    if (!/^[0-9]{10}$/.test(phone)) return res.status(400).json({ message: 'Sahi 10-digit phone number daalo' });
    if (password.length < 6) return res.status(400).json({ message: 'Password kam se kam 6 character ka hona chahiye' });

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
    if (!checkRateLimit('login_' + phone)) {
      return res.status(429).json({ message: 'Bahut zyada attempts ho gaye. 15 minute baad try karo.' });
    }
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

// @POST /api/auth/forgot-password
// Step 1: OTP generate karo (abhi demo mein response mein bhej rahe hain,
// real launch ke liye yeh SMS/WhatsApp se bhejni hai, response mein nahi)
const resetOtpStore = {};
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!checkRateLimit('forgot_' + phone, 3, 15 * 60 * 1000)) {
      return res.status(429).json({ message: 'Bahut zyada attempts. Baad mein try karo.' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'Is phone se koi account nahi mila' });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    resetOtpStore[phone] = { otp, expires: Date.now() + 10 * 60 * 1000 };

    // TODO: production mein yeh OTP WhatsApp/SMS se bhejo, response mein mat bhejo
    // Abhi demo ke liye response mein bhej rahe hain taaki testing aasan ho
    res.json({ message: 'OTP generate ho gaya', otp, expiresIn: '10 minutes' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/auth/reset-password
// Step 2: OTP verify karke password reset karo
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Phone, OTP aur kam se kam 6 character ka password chahiye' });
    }
    const record = resetOtpStore[phone];
    if (!record || record.otp !== otp || Date.now() > record.expires) {
      return res.status(400).json({ message: 'OTP galat ya expire ho gaya' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User nahi mila' });
    user.password = newPassword; // pre-save hook hashes it
    await user.save();
    delete resetOtpStore[phone];
    res.json({ message: 'Password reset ho gaya' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
