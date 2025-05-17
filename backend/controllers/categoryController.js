const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");

// Create Category
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validation
  if (!name || !description) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Check if category already exists
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  // Create category
  const category = await Category.create({
    name,
    description,
    createdBy: {
      user: req.user.id,
      name: req.user.name,
    },
  });

  res.status(201).json(category);
});

// Get all Categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isDeleted: { $ne: true } }).sort(
    "-createdAt"
  );
  res.status(200).json(categories);
});

// Get single category
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true },
  });

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json(category);
});

// Delete Category
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Soft delete the category
  category.isDeleted = true;
  await category.save();

  res.status(200).json({ message: "Category deleted." });
});

// Update Category
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Check if new name already exists (if name is being changed)
  if (name && name !== category.name) {
    const nameExists = await Category.findOne({ name });
    if (nameExists) {
      res.status(400);
      throw new Error("Category name already exists");
    }
  }

  // Update category
  category.name = name || category.name;
  category.description = description || category.description;

  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory,
};
