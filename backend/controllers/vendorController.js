const asyncHandler = require("express-async-handler");
const Vendor = require("../models/vendorModel");
const Product = require("../models/productModel");

// Get all vendors
const getVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find();
  res.status(200).json(vendors);
});

// Get a single vendor
const getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }
  res.status(200).json(vendor);
});

// Get vendors with their associated products
const getVendorsWithProducts = asyncHandler(async (req, res) => {
  try {
    // Get all vendors
    const vendors = await Vendor.find();

    // For each vendor, get their products
    const vendorsWithProducts = await Promise.all(
      vendors.map(async (vendor) => {
        // Find products where the vendor field matches this vendor's ID
        const products = await Product.find({
          vendor: vendor._id,
          isDeleted: { $ne: true },
        }).select("name sku price quantity image category");

        return {
          _id: vendor._id,
          name: vendor.name,
          contact: vendor.contact,
          email: vendor.email,
          address: vendor.address,
          products: products,
        };
      })
    );

    res.status(200).json(vendorsWithProducts);
  } catch (error) {
    res.status(500);
    throw new Error(`Error fetching vendors with products: ${error.message}`);
  }
});

// Create a new vendor
const createVendor = asyncHandler(async (req, res) => {
  const { name, contact, address, email } = req.body;

  // Validation
  if (!name || !contact) {
    res.status(400);
    throw new Error("Please add a name and contact number");
  }

  // Check if vendor already exists
  const vendorExists = await Vendor.findOne({ name, contact });
  if (vendorExists) {
    res.status(400);
    throw new Error("Vendor already exists");
  }

  // Create vendor
  const vendor = await Vendor.create({
    name,
    contact,
    address,
    email,
  });

  res.status(201).json(vendor);
});

// Update vendor
const updateVendor = asyncHandler(async (req, res) => {
  const { name, contact, address, email } = req.body;

  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  // Update vendor
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
