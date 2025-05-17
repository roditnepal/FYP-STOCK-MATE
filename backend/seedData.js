const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const Category = require("./models/categoryModel");
const Product = require("./models/productModel");
require("dotenv").config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Delete existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      {
        name: "Electronics",
        description: "Electronic devices and accessories",
        createdBy: {
          user: "000000000000000000000000", // Will be updated with admin ID
          name: "System",
        },
      },
      {
        name: "Food",
        description: "Food and beverages",
        createdBy: {
          user: "000000000000000000000000", // Will be updated with admin ID
          name: "System",
        },
      },
      {
        name: "Fashion",
        description: "Clothing and accessories",
        createdBy: {
          user: "000000000000000000000000", // Will be updated with admin ID
          name: "System",
        },
      },
      {
        name: "Accessories",
        description: "General accessories",
        createdBy: {
          user: "000000000000000000000000", // Will be updated with admin ID
          name: "System",
        },
      },
    ]);

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@stockmate.com",
      password: "Admin@123",
      role: "admin",
      phone: "+9779876543210",
      bio: "System administrator",
    });

    // Update category createdBy with admin ID
    await Category.updateMany(
      {},
      {
        $set: {
          "createdBy.user": adminUser._id,
          "createdBy.name": adminUser.name,
        },
      }
    );

    // Create employee user with access to all categories
    const employeeUser = await User.create({
      name: "Regular Employee",
      email: "employee@stockmate.com",
      password: "Employee@123",
      role: "employee",
      categories: categories.map((cat) => cat._id),
      phone: "+9771234567890",
      bio: "Regular employee with access to all products",
    });

    // Create products for each category
    const electronicsCategory = categories.find(
      (cat) => cat.name === "Electronics"
    );
    const foodCategory = categories.find((cat) => cat.name === "Food");
    const fashionCategory = categories.find((cat) => cat.name === "Fashion");
    const accessoriesCategory = categories.find(
      (cat) => cat.name === "Accessories"
    );

    // Electronics products
    await Product.insertMany([
      {
        name: "iPhone 13 Pro",
        sku: "IP13P-256-BLK",
        description: "Latest iPhone with A15 Bionic chip",
        price: 999.99,
        quantity: 50,
        category: electronicsCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      {
        name: "Samsung 4K TV",
        sku: "SAM-TV-55-4K",
        description: "55-inch 4K Smart TV",
        price: 799.99,
        quantity: 30,
        category: electronicsCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      {
        name: "MacBook Pro M2",
        sku: "MBP-M2-13",
        description: "13-inch MacBook Pro with M2 chip",
        price: 1299.99,
        quantity: 25,
        category: electronicsCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
    ]);

    // Food products
    await Product.insertMany([
      {
        name: "Organic Coffee Beans",
        sku: "COF-ORG-1KG",
        description: "Premium organic coffee beans",
        price: 19.99,
        quantity: 100,
        category: foodCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      {
        name: "Dark Chocolate",
        sku: "CHOC-DARK-200G",
        description: "70% dark chocolate bar",
        price: 4.99,
        quantity: 200,
        category: foodCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      {
        name: "Green Tea",
        sku: "TEA-GRN-100B",
        description: "Japanese green tea, 100 bags",
        price: 12.99,
        quantity: 150,
        category: foodCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
    ]);

    // Fashion products
    await Product.insertMany([
      {
        name: "Men's Denim Jacket",
        sku: "JKT-DEN-M",
        description: "Classic denim jacket for men",
        price: 89.99,
        quantity: 75,
        category: fashionCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      {
        name: "Women's Summer Dress",
        sku: "DRS-SUM-W",
        description: "Floral summer dress",
        price: 59.99,
        quantity: 100,
        category: fashionCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      {
        name: "Running Shoes",
        sku: "SHO-RUN-UNI",
        description: "Lightweight running shoes",
        price: 79.99,
        quantity: 60,
        category: fashionCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
    ]);

    // Accessories products
    await Product.insertMany([
      {
        name: "Leather Wallet",
        sku: "WLT-LTH-BLK",
        description: "Genuine leather wallet",
        price: 29.99,
        quantity: 120,
        category: accessoriesCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      {
        name: "Sunglasses",
        sku: "SUN-AVI-BLK",
        description: "Classic aviator sunglasses",
        price: 49.99,
        quantity: 80,
        category: accessoriesCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      {
        name: "Smart Watch",
        sku: "WAT-SMT-BLK",
        description: "Fitness tracking smartwatch",
        price: 199.99,
        quantity: 40,
        category: accessoriesCategory._id,
        user: adminUser._id,
        createdBy: {
          user: adminUser._id,
          name: adminUser.name,
        },
        image: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
    ]);

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
    console.log("====================================");
    console.log(
      "Categories Created:",
      categories.map((cat) => cat.name).join(", ")
    );
    console.log("====================================");
    console.log("Products Created: 12 products across all categories");
    console.log("====================================");

    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
