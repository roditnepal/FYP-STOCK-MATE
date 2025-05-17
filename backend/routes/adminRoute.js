const express = require("express");
const router = express.Router();
const { protect } = require("../middleWare/authMiddleware");
// const { authorizeAdmin } = require("../middleWare/adminMiddleware"); // Assuming you have an admin middleware
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");
const multer = require("multer"); // Import multer

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Admin user routes (Protect all admin routes and ensure user is admin)
router.use(protect);
// router.use(authorizeAdmin); // Apply admin authorization middleware

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.post("/users", upload.single("image"), createUser); // Add multer middleware
router.patch("/users/:id", upload.single("image"), updateUser); // Add multer middleware
router.delete("/users/:id", deleteUser);

module.exports = router;
