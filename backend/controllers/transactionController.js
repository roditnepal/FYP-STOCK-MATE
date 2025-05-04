const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactionModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// Create Transaction
const createTransaction = asyncHandler(async (req, res) => {
  const {
    products,
    customer,
    totalAmount,
    paymentMethod,
    paymentStatus,
    notes,
  } = req.body;

  // Validation
  if (
    !products ||
    products.length === 0 ||
    !customer ||
    !customer.name ||
    !totalAmount
  ) {
    res.status(400);
    throw new Error("Please provide products, customer name, and total amount");
  }

  // Verify user has access to all product categories
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (product) {
      if (
        req.user.role !== "admin" &&
        (!req.user.categories ||
          !req.user.categories.includes(product.category))
      ) {
        res.status(403);
        throw new Error(
          `You don't have permission to sell product: ${product.name}`
        );
      }
    }
  }

  // Create transaction
  const transaction = await Transaction.create({
    user: req.user.id,
    products,
    customer,
    totalAmount,
    paymentMethod: paymentMethod || "Cash",
    paymentStatus: paymentStatus || "Paid",
    notes,
    transactionDate: new Date(),
    performedBy: {
      user: req.user.id,
      name: req.user.name,
      role: req.user.role,
    },
  });

  // Update product quantities
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (product) {
      // Convert quantity strings to numbers for calculation
      const currentQuantity = parseInt(product.quantity);
      const soldQuantity = parseInt(item.quantity);

      if (!isNaN(currentQuantity) && !isNaN(soldQuantity)) {
        // Update product quantity
        product.quantity = (currentQuantity - soldQuantity).toString();

        // Add edit record
        product.editedBy.push({
          user: req.user.id,
          name: req.user.name,
          date: new Date(),
        });

        await product.save();
      }
    }
  }

  res.status(201).json(transaction);
});

// Get All Transactions
const getTransactions = asyncHandler(async (req, res) => {
  // For regular employees, only show transactions they performed
  let filter = {};

  if (req.user.role === "admin") {
    // Admin can see all transactions
  } else {
    filter = { "performedBy.user": req.user._id };
  }

  const transactions = await Transaction.find(filter)
    .sort("-createdAt")
    .populate("products.product");

  res.status(200).json(transactions);
});

// Get Single Transaction
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(
    "products.product"
  );

  // If transaction doesn't exist
  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  // Check authorization
  if (
    req.user.role !== "admin" &&
    transaction.performedBy.user.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("You don't have permission to view this transaction");
  }

  res.status(200).json(transaction);
});

// Get Transaction Statistics
const getTransactionStats = asyncHandler(async (req, res) => {
  // Only admin can access transaction statistics
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required for transaction statistics");
  }

  // Get date range from query params or default to last 30 days
  const { startDate, endDate } = req.query;

  let dateFilter = {};

  if (startDate && endDate) {
    dateFilter = {
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  } else {
    // Default to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    dateFilter = {
      transactionDate: {
        $gte: thirtyDaysAgo,
      },
    };
  }

  // Get total sales amount
  const totalSales = await Transaction.aggregate([
    {
      $match: { ...dateFilter },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  // Get total number of transactions
  const totalTransactions = await Transaction.countDocuments({
    ...dateFilter,
  });

  // Get top selling products
  const topProducts = await Transaction.aggregate([
    {
      $match: { ...dateFilter },
    },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product",
        name: { $first: "$products.name" },
        totalQuantity: { $sum: "$products.quantity" },
        totalRevenue: { $sum: "$products.totalPrice" },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
  ]);

  // Get sales by payment method
  const salesByPaymentMethod = await Transaction.aggregate([
    {
      $match: { ...dateFilter },
    },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  res.status(200).json({
    totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
    totalTransactions,
    topProducts,
    salesByPaymentMethod,
  });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  getTransactionStats,
};
