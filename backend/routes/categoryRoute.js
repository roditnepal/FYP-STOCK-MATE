const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleWare/authMiddleware");
const {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory,
} = require("../controllers/categoryController");

// Admin only routes
router.post("/", protect, adminOnly, createCategory);
router.get("/", protect, getCategories);
router.get("/:id", protect, getCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);
router.put("/:id", protect, adminOnly, updateCategory);

module.exports = router;
