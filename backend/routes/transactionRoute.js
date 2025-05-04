const express = require("express");
const router = express.Router();
const { protect } = require("../middleWare/authMiddleware");
const {
  createTransaction,
  getTransactions,
  getTransaction,
  getTransactionStats,
} = require("../controllers/transactionController");

// Transaction routes
router.post("/", protect, createTransaction);
router.get("/", protect, getTransactions);
router.get("/stats", protect, getTransactionStats);
router.get("/:id", protect, getTransaction);

module.exports = router;
