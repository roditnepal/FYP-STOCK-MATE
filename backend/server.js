const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const transactionRoute = require("./routes/transactionRoute");
const adminRoute = require("./routes/adminRoute");
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const categoryRoutes = require("./routes/categoryRoute");
const uploadRoutes = require("./routes/uploadRoutes");

// Log environment variables (without sensitive data)
console.log("=== Environment Configuration ===");
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "exists" : "missing");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "exists" : "missing"
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "exists" : "missing"
);

// Configure Cloudinary
console.log("=== Configuring Cloudinary ===");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Test Cloudinary configuration
cloudinary.api
  .ping()
  .then(() => console.log("Cloudinary connection successful"))
  .catch((err) => console.error("Cloudinary connection failed:", err));

const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

//Routes Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/admin", adminRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api", uploadRoutes);

//Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

const PORT = process.env.PORT || 8000;

//ERROR middleware
app.use(errorHandler);

mongoose.set("strictQuery", true);

//Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("=== MongoDB Connection ===");
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
