const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { get } = require("mongoose");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // Assuming you have a utility to send emails

// Function to generate a token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
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

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: req.body.role || "employee", // Default to employee if role not specified
    categories: req.body.categories || [],
  });

  // Generate token
  const token = generateToken(user._id);

  // Send http-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 864000), // 1 day
    sameSite: "none",
    secure: true,
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
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  console.log("Login attempt:", { email: req.body.email });

  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    console.log("Missing fields:", { email: !!email, password: !!password });
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  // Check if user exists
  const user = await User.findOne({ email });
  console.log("User found:", !!user);

  if (!user) {
    console.log("User not found for email:", email);
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Check if password matches
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  console.log("Password check:", { passwordIsCorrect });

  if (!passwordIsCorrect) {
    console.log("Invalid password for user:", email);
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Generate token
  const token = generateToken(user._id);
  console.log("Token generated successfully");

  // Send http-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 864000), // 1 day
    sameSite: "none",
    secure: true,
  });
  console.log("Cookie set successfully");

  const {
    _id,
    name,
    email: userEmail,
    phone,
    photo,
    bio,
    role,
    categories,
  } = user;
  console.log("Login successful for user:", { name, email: userEmail, role });

  res.status(200).json({
    _id,
    name,
    email: userEmail,
    phone,
    photo,
    bio,
    role,
    categories,
    token,
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({
    message: "Logged out",
  });
});

// Get user data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, phone, photo, bio, role, categories } = user;
    res.status(200).json({
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
    res.status(404);
    throw new Error("User not found");
  }
});

// Get login status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

// Update user data
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, phone, photo, bio, role, categories } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.photo = req.body.photo || photo;
    user.bio = req.body.bio || bio;

    // Only admin can update role and categories
    if (req.user.role === "admin" && req.body.role) {
      user.role = req.body.role;
    }

    if (req.user.role === "admin" && req.body.categories) {
      user.categories = req.body.categories;
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
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Change password
const changepassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { oldpassword, newpassword } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  // Validation
  if (!oldpassword || !newpassword) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  // Check if password matches
  const passwordIsCorrect = await bcrypt.compare(oldpassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    const salt = await bcrypt.genSalt(10); // Generate salt
    user.password = await bcrypt.hash(newpassword, salt); // Hash new password before saving
    await user.save();
    res.status(200).send("Password changed successfully");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

// Forgot password
const forgetpassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Delete any existing reset token
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne(token._id);
  }

  // Generate reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  // Hash token before saving
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save reset token
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expireAt: Date.now() + 30 * 60 * 1000, // 30 minutes
  }).save();

  // Construct reset URL
  const resetURL = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset email
  const message = `<h2>Hello ${user.name}</h2>
    <p>You requested for password reset. Please use the URL below to reset your password.</p>
    <p>This reset link is valid for 30 minutes</p>
    <a href=${resetURL} clicktracking=off>${resetURL}</a>

    <p>Regards,</p>
    <p>Stock Mate Team</p>`;

  const subject = "Password Reset Request (STOCKMATE)";
  const send_to = user.email;
  const send_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, send_from, send_from);
    res.status(200).json({ success: true, message: "Reset email sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email could not be sent. Please try again later");
  }
});

// Reset password
const resetpassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token and compare with the hashed token in the database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find token in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expireAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Find user
  const user = await User.findOne({ _id: userToken.userId });
  const salt = await bcrypt.genSalt(10); // Generate salt
  user.password = await bcrypt.hash(password, salt); // Hash password before saving
  await user.save();

  res.status(200).json({
    message: "Password reset successful",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changepassword,
  forgetpassword,
  resetpassword,
};
