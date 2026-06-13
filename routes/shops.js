const express = require("express");
const router = express.Router();
const Shop = require("../models/Shop");
const { protect } = require("../middleware/auth");
router.get("/", async (req, res) => {
  try {
    const { area, category } = req.query;
    const filter = {};
    if (area) filter["address.area"] = area;
    if (category) filter.category = category;
    const shops = await Shop.find(filter).populate("owner", "name phone");
    res.json(shops);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get("/my", protect, async (req, res) => {
  try { const shop = await Shop.findOne({ owner: req.user._id }); res.json(shop); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post("/", protect, async (req, res) => {
  try {
    const existing = await Shop.findOne({ owner: req.user._id });
    if (existing) return res.status(400).json({ message: "Shop already exists" });
    const shop = await Shop.create({ ...req.body, owner: req.user._id });
    res.status(201).json(shop);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put("/my", protect, async (req, res) => {
  try { const shop = await Shop.findOneAndUpdate({ owner: req.user._id }, req.body, { new: true, upsert: true }); res.json(shop); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.put("/my/toggle", protect, async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    shop.isOpen = !shop.isOpen;
    await shop.save();
    res.json({ isOpen: shop.isOpen });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
