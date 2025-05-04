const express = require("express");
const Vendor = require("../models/vendorModel"); // Import the Vendor model
const router = express.Router();

// Get all vendors
router.get("/", async (req, res) => {
  try {
    const vendors = await Vendor.find(); // Fetch all vendors from the database
    res.json(vendors); // Return vendors as a JSON response
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors
  }
});

module.exports = router;
