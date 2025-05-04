const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res.status(200).json(users);
});

// Get Single User
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Create New User
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, categories, phone, bio, photo } =
    req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password should be at least 6 characters");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "employee",
    categories: categories || [],
    phone: phone || "",
    bio: bio || "",
    photo: photo || "https://i.ibb.co/4pDNDk1/avatar.png",
  });

  if (user) {
    const { _id, name, email, phone, photo, bio, role, categories } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      photo,
      bio,
      role,
      categories,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update user fields
  const { name, email, role, categories, phone, bio, photo } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;
  if (photo) user.photo = photo;
  if (role) user.role = role;
  if (categories) user.categories = categories;

  // For email, check for uniqueness
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = email;
  }

  // Update password if provided
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error("Password should be at least 6 characters");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();
  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    photo: updatedUser.photo,
    bio: updatedUser.bio,
    role: updatedUser.role,
    categories: updatedUser.categories,
  });
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Cannot delete self
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }

  await User.deleteOne({ _id: user._id });
  res.status(200).json({ message: "User deleted successfully" });
});

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
