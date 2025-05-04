const express = require("express");
const { getCategories, createCategory } = require("../controllers/categoryController");
const { protect } = require("../middleWare/authMiddleware");

const router = express.Router();

// Routes
router.get("/", getCategories);
router.post("/", protect, createCategory);

module.exports = router;