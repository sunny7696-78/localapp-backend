const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications, unread });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put("/read-all", protect, async (req, res) => {
  try { await Notification.updateMany({ user: req.user._id }, { isRead: true }); res.json({ message: "All marked read" }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.put("/:id/read", protect, async (req, res) => {
  try { await Notification.findByIdAndUpdate(req.params.id, { isRead: true }); res.json({ message: "Marked read" }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
