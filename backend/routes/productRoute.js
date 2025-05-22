const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getExpiringProducts,
  getLowStockProducts,
  getVendorProducts,
  sendEmailToVendors,
} = require("../controllers/productController");
const { uploadMiddleware } = require("../utils/fileUpload");
const { protect, adminOnly } = require("../middleWare/authMiddleware");

// Create product route
router.post("/", protect, uploadMiddleware, createProduct);

// Send email to vendors route
router.post("/send-email", protect, adminOnly, sendEmailToVendors);

// Get all products route
router.get("/", protect, getProducts);

// Get low stock products
router.get("/low-stock", protect, getLowStockProducts);

// Get expiring products route
router.get("/expiring", protect, getExpiringProducts);

// Get products by vendor route
router.get("/vendor/:vendorId", protect, getVendorProducts);

// Get single product route
router.get("/:id", protect, getProduct);

// Delete product route
router.delete("/:id", protect, deleteProduct);

// Update product route
router.patch("/:id", protect, uploadMiddleware, updateProduct);

module.exports = router;