const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleWare/authMiddleware");

// Apply middleware to all routes
router.use(protect);
router.use(adminOnly);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
