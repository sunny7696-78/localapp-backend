const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const { protect, driverOnly } = require('../middleware/auth');
const { calculateRideCommission } = require('../utils/commission');

// Fare calculation utility
const calculateFare = (vehicleType, distance) => {
  const baseFare = { bike: 25, auto: 35, car: 50 };
  const perKm = { bike: 8, auto: 12, car: 15 };
  return Math.round(baseFare[vehicleType] + (distance * perKm[vehicleType]));
};

// @POST /api/rides - book a ride
router.post('/', protect, async (req, res) => {
  try {
    const { vehicleType, pickup, drop, paymentMethod } = req.body;
    const distance = Math.round(Math.random() * 8 + 1); // simulated; replace with real geo calc
    const fare = calculateFare(vehicleType, distance);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const { commissionRate, platformCommission, driverPayout } = calculateRideCommission(fare);

    const ride = await Ride.create({
      user: req.user._id,
      vehicleType,
      pickup,
      drop,
      distance,
      duration: Math.round(distance * 3 + 5),
      fare,
      commissionRate,
      platformCommission,
      driverPayout,
      paymentMethod: paymentMethod || 'cod',
      otp,
    });
    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/rides/my
router.get('/my', protect, async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('driver', 'name phone vehicle');
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/rides/available - for drivers
router.get('/available', protect, driverOnly, async (req, res) => {
  try {
    const { vehicleType } = req.query;
    const filter = { status: 'searching' };
    if (vehicleType) filter.vehicleType = vehicleType;
    const rides = await Ride.find(filter).populate('user', 'name phone');
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/rides/:id/accept - driver accepts ride
router.put('/:id/accept', protect, driverOnly, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.status !== 'searching')
      return res.status(400).json({ message: 'Ride already taken' });
    ride.driver = req.user._id;
    ride.status = 'accepted';
    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/rides/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/rides/:id/rate
router.put('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const ride = await Ride.findByIdAndUpdate(req.params.id, { rating, review }, { new: true });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
