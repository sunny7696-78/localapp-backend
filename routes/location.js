// routes/location.js
// Driver apni location update karta hai — customer real-time dekh sakta hai

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// In-memory store (production mein Redis use karo)
// { orderId: { lat, lng, updatedAt } }
const driverLocations = {};

// @PUT /api/location/order/:orderId
// Driver apni current location update karta hai
router.put('/order/:orderId', protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ message: 'lat aur lng required hain' });

    driverLocations[req.params.orderId] = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      driverName: req.user.name,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/location/order/:orderId
// Customer driver ki location fetch karta hai
router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const loc = driverLocations[req.params.orderId];
    if (!loc) {
      // Doraha ka default location return karo agar driver ne update nahi kiya
      return res.json({
        lat: 30.7978,
        lng: 76.0314,
        driverName: 'Driver',
        updatedAt: new Date().toISOString(),
        isDefault: true,
      });
    }
    res.json(loc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, driverLocations };
