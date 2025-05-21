const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleWare/authMiddleware");
const {
  getVendors,
  getVendor,
  getVendorsWithProducts,
  createVendor,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");

// Protect all vendor routes
router.use(protect);

// Routes that require admin privileges
router.post("/", adminOnly, createVendor);
router.put("/:id", adminOnly, updateVendor);
router.delete("/:id", adminOnly, deleteVendor);

// Routes accessible to all authenticated users
router.get("/", getVendors);
router.get("/with-products", adminOnly, getVendorsWithProducts);
router.get("/:id", getVendor);

module.exports = router;
