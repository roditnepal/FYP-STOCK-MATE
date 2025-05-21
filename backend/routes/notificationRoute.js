const express = require("express");
const router = express.Router();
const Notification = require("../models/notificationModel");
const Product = require("../models/productModel");
const { protect } = require("../middleWare/authMiddleware");
const asyncHandler = require("express-async-handler");

// Get all notifications
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const notifications = await Notification.find()
        .sort("-createdAt")
        .populate("productId", "name quantity image category vendor");

      res.status(200).json(notifications);
    } catch (error) {
      res.status(500);
      throw new Error("Error fetching notifications");
    }
  })
);

// Mark notification as read
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    try {
      await Notification.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Notification removed" });
    } catch (error) {
      res.status(500);
      throw new Error("Error removing notification");
    }
  })
);

module.exports = router;
