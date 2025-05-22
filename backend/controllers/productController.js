const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Notification = require("../models/notificationModel");
const Vendor = require("../models/vendorModel");
const sendEmail = require("../utils/sendEmail");
const path = require("path");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

// Helper function to create low stock notification and send email to selected vendors
const createLowStockNotification = async (product, selectedVendorIds) => {
  try {
    const vendors = await Vendor.find({ _id: { $in: selectedVendorIds } });
    const vendorInfo = vendors.length
      ? `from vendors ${vendors.map(v => v.name).join(", ")}`
      : "";
    const message = `Low stock alert: ${product.name} ${vendorInfo} has only ${product.quantity} units left.`;
    
    // Create notification
    const notification = new Notification({
      message,
      productId: product._id,
    });
    await notification.save();
    console.log(`Low stock notification created for ${product.name}`);

    // Send email to selected vendors with email addresses
    for (const vendor of vendors) {
      if (vendor.email) {
        await sendEmail(
          vendor.email,
          `Low Stock Alert: ${product.name}`,
          `Dear ${vendor.name},\n\nThe product "${product.name}" (SKU: ${product.sku}) has only ${product.quantity} units left in stock. Please consider restocking.\n\nBest regards,\nStockMate Team`
        );
      }
    }
  } catch (error) {
    console.error("Error creating low stock notification:", error);
  }
};

// Helper function to create expiring product notification and send email to selected vendors
const createExpiringProductNotification = async (product, selectedVendorIds) => {
  try {
    const vendors = await Vendor.find({ _id: { $in: selectedVendorIds } });
    const vendorInfo = vendors.length
      ? `from vendors ${vendors.map(v => v.name).join(", ")}`
      : "";
    const message = `Expiring soon: ${product.name} ${vendorInfo} expires on ${product.expiryDate.toDateString()}.`;
    
    // Create notification
    const notification = new Notification({
      message,
      productId: product._id,
    });
    await notification.save();
    console.log(`Expiring product notification created for ${product.name}`);

    // Send email to selected vendors with email addresses
    for (const vendor of vendors) {
      if (vendor.email) {
        await sendEmail(
          vendor.email,
          `Expiring Product Alert: ${product.name}`,
          `Dear ${vendor.name},\n\nThe product "${product.name}" (SKU: ${product.sku}) is set to expire on ${product.expiryDate.toDateString()}. Please take necessary action.\n\nBest regards,\nStockMate Team`
        );
      }
    }
  } catch (error) {
    console.error("Error creating expiring product notification:", error);
  }
};

// Send email to selected vendors for a product
const sendEmailToVendors = asyncHandler(async (req, res) => {
  const { productId, vendorIds } = req.body;

  // Validation
  if (!productId || !vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
    res.status(400);
    throw new Error("Product ID and vendor IDs are required");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Validate vendors
  const vendors = await Vendor.find({ _id: { $in: vendorIds } });
  if (vendors.length !== vendorIds.length) {
    res.status(400);
    throw new Error("One or more vendors not found");
  }

  // Send email to each vendor
  try {
    for (const vendor of vendors) {
      if (vendor.email) {
        await sendEmail(
          `Low Stock Alert: ${product.name}`,
          `Dear ${vendor.name},\n\nThe product "${product.name}" (SKU: ${product.sku}) has only ${product.quantity} units left in stock. Please consider restocking.\n\nBest regards,\nStockMate Team`,
          vendor.email
        );
      }
    }
    res.status(200).json({ message: "Emails sent successfully to selected vendors" });
  } catch (error) {
    console.error("Error sending emails to vendors:", error);
    res.status(500);
    throw new Error("Failed to send emails: " + error.message);
  }
});

// Create Product
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
    vendors,
    lowStockThreshold,
  } = req.body;

  // Parse vendors if provided as JSON string
  let vendorIds = [];
  if (vendors) {
    vendorIds = typeof vendors === 'string' ? JSON.parse(vendors) : vendors;
  }

  // Validation
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

  // Validate vendors if provided
  if (vendorIds.length > 0) {
    const vendorsExist = await Vendor.find({ _id: { $in: vendorIds } });
    if (vendorsExist.length !== vendorIds.length) {
      console.log("One or more vendors not found:", vendorIds);
      res.status(400);
      throw new Error("One or more vendors not found");
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
  }

  console.log(vendorIds);

  // Create Product
  try {
    console.log("Creating product in database...");
    const product = await Product.create({
      user: req.user.id,
      name,
      sku,
      category,
      vendors: vendorIds,
      quantity,
      price,
      description,
      expiryDate,
      lowStockThreshold,
      image: fileData,
      createdBy: {
        user: req.user.id,
        name: req.user.name,
      },
    });

    // Update vendors' products array
    if (vendorIds.length > 0) {
      await Vendor.updateMany(
        { _id: { $in: vendorIds } },
        { $addToSet: { products: product._id } }
      );
    }

    console.log("Product created successfully:", product._id);
    res.status(201).json(product);

    // Check stock level and expiry for notifications
    if (parseInt(product.quantity) <= (product.lowStockThreshold || 10) && vendorIds.length > 0) {
      await createLowStockNotification(product, vendorIds);
    }
    if (product.checkExpiringSoon() && vendorIds.length > 0) {
      await createExpiringProductNotification(product, vendorIds);
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500);
    throw new Error("Error creating product: " + error.message);
  }
});

// Get all Products
const getProducts = asyncHandler(async (req, res) => {
  let filter = { isDeleted: { $ne: true } };

  if (req.user.role === "admin") {
    // No additional filter
  } else {
    if (req.user.categories && req.user.categories.length > 0) {
      filter.category = { $in: req.user.categories };
    } else {
      return res.status(200).json([]);
    }
  }

  const products = await Product.find(filter)
    .populate("category", "name description")
    .populate("vendors", "name contact email");
  res.status(200).json(products);
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true },
  })
    .populate("category", "name description")
    .populate("vendors", "name contact email");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

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
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (req.user.role !== "admin") {
    if (
      !req.user.categories ||
      !req.user.categories.includes(product.category)
    ) {
      res.status(403);
      throw new Error("You don't have permission to delete this product");
    }
  }

  // Remove product from vendors' products array
  await Vendor.updateMany(
    { products: product._id },
    { $pull: { products: product._id } }
  );

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
    vendors,
    lowStockThreshold,
  } = req.body;
  const { id } = req.params;

  // Parse vendors if provided as JSON string
  let vendorIds = [];
  if (vendors) {
    vendorIds = typeof vendors === 'string' ? JSON.parse(vendors) : vendors;
  }

  console.log("Update request received:", {
    id,
    name,
    category,
    quantity,
    price,
    description,
    expiryDate,
    vendors: vendorIds,
    lowStockThreshold,
  });

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (req.user.role !== "admin") {
    if (
      !req.user.categories ||
      !req.user.categories.includes(product.category)
    ) {
      res.status(403);
      throw new Error("You don't have permission to update this product");
    }
    if (
      category &&
      category !== product.category.toString() &&
      (!req.user.categories || !req.user.categories.includes(category))
    ) {
      res.status(403);
      throw new Error("You don't have permission to change to this category");
    }
  }

  // Validate vendors if provided
  if (vendorIds.length > 0) {
    const vendorsExist = await Vendor.find({ _id: { $in: vendorIds } });
    if (vendorsExist.length !== vendorIds.length) {
      res.status(400);
      throw new Error("One or more vendors not found");
    }
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    let uploadedFile;
    try {
      console.log("Attempting to upload file to Cloudinary for update:", req.file.path);
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "stockmate",
        resource_type: "image",
      });
      console.log("Cloudinary upload successful for update:", uploadedFile.secure_url);
    } catch (error) {
      console.error("Cloudinary upload error during update:", error);
      res.status(500);
      throw new Error("Image could not be uploaded during update: " + error.message);
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

  // Update vendors' products array
  if (vendorIds.length > 0 || product.vendors.length > 0) {
    // Remove product from old vendors
    await Vendor.updateMany(
      { products: product._id },
      { $pull: { products: product._id } }
    );
    // Add product to new vendors
    if (vendorIds.length > 0) {
      await Vendor.updateMany(
        { _id: { $in: vendorIds } },
        { $addToSet: { products: product._id } }
      );
    }
  }

  // Create update object
  const updateData = {
    name: name || product.name,
    category: category || product.category,
    quantity: quantity || product.quantity,
    price: price || product.price,
    description: description || product.description,
    vendors: vendorIds.length > 0 ? vendorIds : product.vendors,
    lowStockThreshold: lowStockThreshold || product.lowStockThreshold,
    image: Object.keys(fileData).length === 0 ? product.image : fileData,
    $push: { editedBy: editInfo },
  };

  if (expiryDate) {
    updateData.expiryDate = new Date(expiryDate);
  } else if (expiryDate === "") {
    updateData.expiryDate = null;
  }

  console.log("Updating product with data:", updateData);

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name description")
    .populate("vendors", "name contact email");

  if (!updatedProduct) {
    res.status(400);
    throw new Error("Product update failed");
  }

  console.log("Product updated successfully:", updatedProduct);

  // Check notifications
  const quantityNum = parseInt(updatedProduct.quantity);
  const thresholdNum = updatedProduct.lowStockThreshold || 10;
  if (!isNaN(quantityNum) && quantityNum <= thresholdNum && vendorIds.length > 0) {
    await createLowStockNotification(updatedProduct, vendorIds);
  }
  if (updatedProduct.checkExpiringSoon() && vendorIds.length > 0) {
    await createExpiringProductNotification(updatedProduct, vendorIds);
  }

  res.status(200).json(updatedProduct);
});

// Get expiring products
const getExpiringProducts = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const products = await Product.find({
    expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
    isDeleted: { $ne: true },
  })
    .populate("category", "name description")
    .populate("vendors", "name contact email");

  res.status(200).json(products);
});

// Get low stock products
const getLowStockProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({
      isDeleted: { $ne: true },
    })
      .populate("category", "name description")
      .populate("vendors", "name contact email");

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
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      res.status(404);
      throw new Error("Vendor not found");
    }

    const products = await Product.find({
      vendors: vendorId,
      isDeleted: { $ne: true },
    })
      .populate("category", "name description")
      .populate("vendors", "name contact email");
    
    console.log(products);

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
  sendEmailToVendors,
};