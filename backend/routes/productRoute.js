const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getExpiringProducts,
} = require("../controllers/productController");
const { uploadMiddleware } = require("../utils/fileUpload");
const { protect } = require("../middleWare/authMiddleware");

// Create product route
router.post("/", protect, uploadMiddleware, createProduct);

// Get all products route
router.get("/", protect, getProducts);

// Get single product route
router.get("/:id", protect, getProduct);

// Delete product route
router.delete("/:id", protect, deleteProduct);

// Update product route
router.patch("/:id", protect, uploadMiddleware, updateProduct);

// Get expiring products route
router.get("/expiring", protect, getExpiringProducts);

module.exports = router;
