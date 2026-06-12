const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/restaurants
router.get('/', async (req, res) => {
  try {
    const { search, cuisine } = req.query;
    const filter = { isOpen: true };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (cuisine) filter.cuisine = { $in: [cuisine] };
    const restaurants = await Restaurant.find(filter).select('-menu');
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/restaurants/:id - includes full menu
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/restaurants
router.post('/', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/restaurants/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/restaurants/:id/menu - add menu item
router.post('/:id/menu', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    restaurant.menu.push(req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/restaurants/:id/menu/:itemId
router.delete('/:id/menu/:itemId', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    restaurant.menu = restaurant.menu.filter(i => i._id.toString() !== req.params.itemId);
    await restaurant.save();
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
