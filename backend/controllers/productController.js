const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { fileSizeFormatter } = require("../utils/fileUpload");

// Create Product
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description, expiryDate } = req.body;

  try {
    // Validation
    if (!name || !category || !quantity || !price || !description || !expiryDate) {
      res.status(400);
      throw new Error("Please fill in all fields including expiry date");
    }

    // Handle Image upload
    let fileData = {};
    if (req.file) {
      try {
        const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: "Pinvent App",
          resource_type: "image",
        });
        fileData = {
          fileName: req.file.originalname,
          filePath: uploadedFile.secure_url,
          fileType: req.file.mimetype,
          fileSize: fileSizeFormatter(req.file.size, 2),
        };
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500);
        throw new Error(`Image could not be uploaded: ${error.message}`);
      }
    }

    // Create Product
    const product = await Product.create({
      user: req.user.id,
      name,
      sku,
      category,
      quantity,
      price,
      description,
      expiryDate,
      image: fileData,
      createdBy: {
        user: req.user.id,
        name: req.user.name,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
});

// Get all Products
const getProducts = asyncHandler(async (req, res) => {
  try {
    let filter = { isDeleted: { $ne: true } }; // Don't show deleted products

    // If admin, can see all products
    if (req.user.role !== "admin") {
      // For non-admin, only show products they have access to
      if (req.user.categories && req.user.categories.length > 0) {
        filter.category = { $in: req.user.categories };
      } else {
        // If user has no categories, return empty array
        return res.status(200).json([]);
      }
    }

    const products = await Product.find(filter).sort("-createdAt");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500);
    throw new Error("Failed to fetch products");
  }
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ObjectID
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid product ID format");
    }

    const product = await Product.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    // If product doesn't exist
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Check if user has access to this product's category
    if (req.user.role !== "admin") {
      if (!req.user.categories || !req.user.categories.includes(product.category)) {
        res.status(403);
        throw new Error("You don't have permission to view this product");
      }
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ObjectID
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid product ID format");
    }

    const product = await Product.findById(id);
    // If product doesn't exist
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Check authorization based on user role and category
    if (req.user.role !== "admin") {
      if (!req.user.categories || !req.user.categories.includes(product.category)) {
        res.status(403);
        throw new Error("You don't have permission to delete this product");
      }
    }

    // Soft delete the product
    product.isDeleted = true;
    product.deletedBy = {
      user: req.user.id,
      name: req.user.name,
      date: new Date(),
    };

    await product.save();
    res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, quantity, price, description, expiryDate } = req.body;
  const { id } = req.params;

  try {
    // Validate ObjectID
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid product ID format");
    }

    const product = await Product.findById(id);
    // If product doesn't exist
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Check authorization based on user role and category
    if (req.user.role !== "admin") {
      if (!req.user.categories || !req.user.categories.includes(product.category)) {
        res.status(403);
        throw new Error("You don't have permission to update this product");
      }
      if (
        category &&
        category !== product.category &&
        (!req.user.categories || !req.user.categories.includes(category))
      ) {
        res.status(403);
        throw new Error("You don't have permission to change to this category");
      }
    }

    // Handle Image upload
    let fileData = {};
    if (req.file) {
      try {
        const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: "Pinvent App",
          resource_type: "image",
        });
        fileData = {
          fileName: req.file.originalname,
          filePath: uploadedFile.secure_url,
          fileType: req.file.mimetype,
          fileSize: fileSizeFormatter(req.file.size, 2),
        };
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500);
        throw new Error(`Image could not be uploaded: ${error.message}`);
      }
    }

    // Add edit information
    const editInfo = {
      user: req.user.id,
      name: req.user.name,
      date: new Date(),
    };

    // Create update object
    const updateData = {
      name,
      category,
      quantity,
      price,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
      $push: { editedBy: editInfo },
    };

    // Only update expiryDate if it's provided
    if (expiryDate) {
      updateData.expiryDate = new Date(expiryDate);
    }

    // Update Product
    const updatedProduct = await Product.findByIdAndUpdate({ _id: id }, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
});

// Get expiring products
const getExpiringProducts = asyncHandler(async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const products = await Product.find({
      user: req.user.id,
      expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching expiring products:", error);
    res.status(500);
    throw new Error("Failed to fetch expiring products");
  }
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getExpiringProducts,
};