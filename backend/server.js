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
// Configure Cloudinary
require("./config/cloudinaryConfig");
// Import new routes for categories, vendors, and statistics
const categoryRoute = require("./routes/categoryRoute");
const vendorRoute = require("./routes/vendorRoute");
const statisticsRoute = require("./routes/statisticsRoute");

const app = express();



// Middlewares
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

// Routes Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/admin", adminRoute);

// Add new routes for categories, vendors, and statistics
app.use("/api/categories", categoryRoute);
app.use("/api/vendors", vendorRoute);
app.use("/api/statistics", statisticsRoute);

// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

console.log(process.env.MONGODB_URI);

const PORT = process.env.PORT || 8000;

// Error middleware
app.use(errorHandler);

mongoose.set("strictQuery", true);

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });