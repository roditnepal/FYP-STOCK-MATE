const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");

// Get all categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find(); // Fetch all categories
  res.status(200).json(categories);
});

// Create a new category (admin only)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validation
  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  // Check if user is admin
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admins can create categories");
  }

  // Check for duplicate category
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  // Create category
  const category = await Category.create({
    name,
    description: description || "",
    createdBy: {
      user: req.user._id,
      name: req.user.name,
    },
  });

  res.status(201).json(category);
});

module.exports = {
  getCategories,
  createCategory,
};