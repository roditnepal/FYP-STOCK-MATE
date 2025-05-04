const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv").config();
const User = require("./models/userModel");
const Product = require("./models/productModel");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
    seedData();
  })
  .catch((err) => {
    console.log(err);
  });

const seedData = async () => {
  try {
    // Get all product categories to give access to employee
    let allCategories = [];

    try {
      const products = await Product.find();
      allCategories = [...new Set(products.map((product) => product.category))];
      console.log("Available categories:", allCategories);
    } catch (error) {
      console.log("Error fetching product categories:", error.message);
    }

    // Delete existing users with these emails (to avoid duplicates)
    await User.deleteMany({
      email: {
        $in: ["admin@stockmate.com", "employee@stockmate.com"],
      },
    });

    // Create admin user - use insertMany to bypass middleware
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash("Admin@123", salt);
    const hashedEmployeePassword = await bcrypt.hash("Employee@123", salt);

    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@stockmate.com",
        password: hashedAdminPassword,
        role: "admin",
        phone: "+9779876543210",
        bio: "System administrator",
      },
      {
        name: "Regular Employee",
        email: "employee@stockmate.com",
        password: hashedEmployeePassword,
        role: "employee",
        categories: allCategories, // Give access to all categories
        phone: "+9771234567890",
        bio: "Regular employee with access to all products",
      },
    ]);

    const adminUser = users[0];
    const employeeUser = users[1];

    console.log("====================================");
    console.log("Database seeded successfully!");
    console.log("====================================");
    console.log("Admin User Created:");
    console.log("Email: admin@stockmate.com");
    console.log("Password: Admin@123");
    console.log("====================================");
    console.log("Employee User Created:");
    console.log("Email: employee@stockmate.com");
    console.log("Password: Employee@123");
    console.log(`Assigned Categories: ${employeeUser.categories.join(", ")}`);
    console.log("====================================");

    // Disconnect from MongoDB
    mongoose.disconnect();
  } catch (error) {
    console.log("Error seeding data:", error.message);
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
};
