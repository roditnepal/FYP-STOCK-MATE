const express = require("express");
const Product = require("../models/productModel"); // Import the Product model
const Notification = require("../models/notificationModel"); // Import the Notification model
const router = express.Router();

// Get product statistics
router.get("/", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments(); // Count total products
    const outOfStockProducts = await Product.countDocuments({ quantity: 0 }); // Count out-of-stock products
    const notifications = await Notification.countDocuments(); // Count notifications

    res.json({
      totalProducts,
      outOfStockProducts,
      notifications,
    }); // Send statistics as a JSON response
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors
  }
});

module.exports = router;
