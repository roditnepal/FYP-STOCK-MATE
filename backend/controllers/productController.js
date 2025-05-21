const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Notification = require("../models/notificationModel");
const Vendor = require("../models/vendorModel");

const path = require("path");
console.log(
  "Looking for fileUpload at:",
  path.join(__dirname, "../utils/fileUpload.js")
);
console.log(
  "Exists:",
  require("fs").existsSync(path.join(__dirname, "../utils/fileUpload.js"))
);

const { fileSizeFormatter } = require("../utils/fileUpload");

const cloudinary = require("cloudinary").v2;

// Helper function to create low stock notification
const createLowStockNotification = async (product) => {
  try {
    const vendorInfo = product.vendor
      ? `from vendor ${product.vendor.name}`
      : "";
    const notification = new Notification({
      message: `Low stock alert: ${product.name} ${vendorInfo} has only ${product.quantity} units left.`,
      productId: product._id,
    });
    await notification.save();
    console.log(`Low stock notification created for ${product.name}`);
  } catch (error) {
    console.error("Error creating low stock notification:", error);
  }
};

// Create Prouct
const createProduct = asyncHandler(async (req, res) => {
  console.log("=== Starting Product Creation ===");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);

  const {
    name,
    sku,
    category,
    quantity,
    price,
    description,
    expiryDate,
    vendor,
    lowStockThreshold,
  } = req.body;

  // Validation - making expiry date optional
  if (!name || !category || !quantity || !price) {
    console.log("Validation failed - missing required fields");
    res.status(400);
    throw new Error(
      "Please fill in all required fields (name, category, quantity, price)"
    );
  }

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    console.log("Category not found:", category);
    res.status(400);
    throw new Error("Category not found");
  }

  // Validate vendor if provided
  let vendorData = null;
  if (vendor) {
    vendorData = await Vendor.findById(vendor);
    if (!vendorData) {
      console.log("Vendor not found:", vendor);
      res.status(400);
      throw new Error("Vendor not found");
    }
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    console.log("Processing image upload...");
    console.log("File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    // Save image to cloudinary
    let uploadedFile;
    try {
      console.log("Attempting to upload to Cloudinary...");
      console.log("Cloudinary config:", {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? "exists" : "missing",
        api_secret: process.env.CLOUDINARY_API_SECRET ? "exists" : "missing",
      });

      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "stockmate",
        resource_type: "image",
      });

      console.log("Cloudinary upload successful:", {
        url: uploadedFile.secure_url,
        public_id: uploadedFile.public_id,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", {
        message: error.message,
        error: error,
      });
      res.status(500);
      throw new Error("Image could not be uploaded: " + error.message);
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
    console.log("File data prepared:", fileData);
  }

  // Create Product
  try {
    console.log("Creating product in database...");
    const product = await Product.create({
      user: req.user.id,
      name,
      sku,
      category,
      quantity,
      price,
      description,
      expiryDate,
      vendor: vendor || null, // Associate vendor if provided
      image: fileData,
      createdBy: {
        user: req.user.id,
        name: req.user.name,
      },
    });
    console.log("Product created successfully:", product._id);
    res.status(201).json(product);

    // Check stock level for notifications
    if (product.quantity < 10) {
      createLowStockNotification(product);
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500);
    throw new Error("Error creating product: " + error.message);
  }
});

// Get all Products
const getProducts = asyncHandler(async (req, res) => {
  let filter = { isDeleted: { $ne: true } }; // Don't show deleted products

  // If admin, can see all products
  if (req.user.role === "admin") {
    // No additional filter
  } else {
    // For non-admin, only show products they have access to
    if (req.user.categories && req.user.categories.length > 0) {
      filter.category = { $in: req.user.categories };
    } else {
      // If user has no categories, return empty array
      return res.status(200).json([]);
    }
  }

  const products = await Product.find(filter)
    .populate("category", "name description")
    .sort("-createdAt");
  res.status(200).json(products);
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true },
  }).populate("category", "name description");

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user has access to this product's category
  if (req.user.role !== "admin") {
    if (
      !req.user.categories ||
      !req.user.categories.includes(product.category._id.toString())
    ) {
      res.status(403);
      throw new Error("You don't have permission to view this product");
    }
  }

  res.status(200).json(product);
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check authorization based on user role and category
  if (req.user.role !== "admin") {
    // For non-admin users, check if they have access to this category
    if (
      !req.user.categories ||
      !req.user.categories.includes(product.category)
    ) {
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
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    quantity,
    price,
    description,
    expiryDate,
    vendor,
    lowStockThreshold,
  } = req.body;
  const { id } = req.params;

  console.log("Update request received:", {
    id,
    name,
    category,
    quantity,
    price,
    description,
    expiryDate,
    vendor,
    lowStockThreshold,
  });

  const product = await Product.findById(id);

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check authorization based on user role and category
  if (req.user.role !== "admin") {
    // For non-admin users, check if they have access to this category
    if (
      !req.user.categories ||
      !req.user.categories.includes(product.category)
    ) {
      res.status(403);
      throw new Error("You don't have permission to update this product");
    }

    // Additionally, check if they have access to the new category if it's being changed
    if (
      category &&
      category !== product.category &&
      (!req.user.categories || !req.user.categories.includes(category))
    ) {
      res.status(403);
      throw new Error("You don't have permission to change to this category");
    }
  }

  // Validate vendor if provided
  if (vendor && vendor !== product.vendor) {
    const vendorExists = await Vendor.findById(vendor);
    if (!vendorExists) {
      res.status(400);
      throw new Error("Vendor not found");
    }
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      console.log(
        "Attempting to upload file to Cloudinary for update:",
        req.file.path
      );
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "stockmate",
        resource_type: "image",
      });
      console.log(
        "Cloudinary upload successful for update:",
        uploadedFile.secure_url
      );
    } catch (error) {
      console.error("Cloudinary upload error during update:", error);
      res.status(500);
      throw new Error(
        "Image could not be uploaded during update: " + error.message
      );
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Add edit information
  const editInfo = {
    user: req.user.id,
    name: req.user.name,
    date: new Date(),
  };

  // Create update object
  const updateData = {
    name: name || product.name,
    category: category || product.category,
    quantity: quantity || product.quantity,
    price: price || product.price,
    description: description || product.description,
    vendor: vendor || product.vendor,
    lowStockThreshold: lowStockThreshold || product.lowStockThreshold,
    image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    $push: { editedBy: editInfo },
  };

  // Handle expiry date
  if (expiryDate) {
    updateData.expiryDate = new Date(expiryDate);
  } else if (expiryDate === "") {
    updateData.expiryDate = null;
  }

  console.log("Updating product with data:", updateData);

  // Update Product
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name description")
    .populate("vendor", "name contact");

  if (!updatedProduct) {
    res.status(400);
    throw new Error("Product update failed");
  }

  console.log("Product updated successfully:", updatedProduct);

  // Check if quantity is below threshold and create notification if needed
  const quantityNum = parseInt(updatedProduct.quantity);
  const thresholdNum = updatedProduct.lowStockThreshold || 10;

  if (!isNaN(quantityNum) && quantityNum <= thresholdNum) {
    await createLowStockNotification(updatedProduct);
  }

  res.status(200).json(updatedProduct);
});

// Get expiring products
const getExpiringProducts = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const products = await Product.find({
    user: req.user.id,
    expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
  });

  res.status(200).json(products);
});

// Get low stock products
const getLowStockProducts = asyncHandler(async (req, res) => {
  try {
    // Find products where the quantity is below threshold
    // First convert all products to have proper numeric values
    const products = await Product.find({
      isDeleted: { $ne: true },
    })
      .populate("category", "name description")
      .populate("vendor", "name contact email");

    // Filter products where quantity is below the threshold
    const lowStockProducts = products.filter((product) => {
      const quantityNum = parseInt(product.quantity);
      const thresholdNum = product.lowStockThreshold || 10;
      return !isNaN(quantityNum) && quantityNum <= thresholdNum;
    });

    res.status(200).json(lowStockProducts);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500);
    throw new Error("Error fetching low stock products");
  }
});

// Get vendor products
const getVendorProducts = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  try {
    // Verify vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      res.status(404);
      throw new Error("Vendor not found");
    }

    // Find all products associated with this vendor
    const products = await Product.find({
      vendor: vendorId,
      isDeleted: { $ne: true },
    }).populate("category", "name description");

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    res.status(500);
    throw new Error(`Error fetching vendor products: ${error.message}`);
  }
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getExpiringProducts,
  getLowStockProducts,
  getVendorProducts,
};
