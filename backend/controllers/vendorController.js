const asyncHandler = require("express-async-handler");
const Vendor = require("../models/vendorModel");
const Product = require("../models/productModel");

// Get all vendors
const getVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find().populate("products", "name sku price quantity");
  res.status(200).json(vendors);
});

// Get a single vendor
const getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).populate(
    "products",
    "name sku price quantity image category vendors lowStockThreshold"
  );
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }
  res.status(200).json(vendor);
});


// Get vendors with their associated products
const getVendorsWithProducts = asyncHandler(async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("products", "name sku price quantity image category");
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500);
    throw new Error(`Error fetching vendors with products: ${error.message}`);
  }
});

// Create a new vendor
const createVendor = asyncHandler(async (req, res) => {
  const { name, contact, address, email } = req.body;

  if (!name || !contact) {
    res.status(400);
    throw new Error("Please add a name and contact number");
  }

  const vendorExists = await Vendor.findOne({ name, contact });
  if (vendorExists) {
    res.status(400);
    throw new Error("Vendor already exists");
  }

  const vendor = await Vendor.create({
    name,
    contact,
    address,
    email,
    products: [],
  });

  res.status(201).json(vendor);
});

// Update vendor
const updateVendor = asyncHandler(async (req, res) => {
  const { name, contact, address, email } = req.body;

  console.log(req.body);
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    {
      name: name || vendor.name,
      contact: contact || vendor.contact,
      address: address || vendor.address,
      email: email || vendor.email,
    },
    { new: true }
  );

  res.status(200).json(updatedVendor);
});

// Delete vendor
const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  // Remove vendor from associated products
  await Product.updateMany(
    { vendors: vendor._id },
    { $pull: { vendors: vendor._id } }
  );

  await vendor.deleteOne();
  res.status(200).json({ message: "Vendor deleted successfully" });
});

module.exports = {
  getVendors,
  getVendor,
  getVendorsWithProducts,
  createVendor,
  updateVendor,
  deleteVendor,
};