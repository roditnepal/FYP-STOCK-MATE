const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    //verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    //get user id from token
    user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("No user found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// Admin middleware
const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Admin access required");
  }
});

// Middleware to check if user has access to specific category
const categoryAccess = asyncHandler(async (req, res, next) => {
  // Get category from request body or params
  const category = req.body.category || req.params.category;

  // Admin has access to all categories
  if (req.user.role === "admin") {
    return next();
  }

  // Check if employee has access to this category
  if (req.user.categories && req.user.categories.includes(category)) {
    return next();
  }

  res.status(403);
  throw new Error("You don't have access to this category");
});

module.exports = { protect, adminOnly, categoryAccess };
