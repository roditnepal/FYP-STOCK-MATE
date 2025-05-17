const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (Ensure these environment variables are set in your backend .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Set up multer for memory storage (to get the file buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/upload-image
// This route expects a single file with the field name 'image'
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    // Upload the image to Cloudinary
    // Using the data URI format for upload
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "profile_images", // Optional: specify a folder in Cloudinary
        // Add any other Cloudinary upload options here (e.g., transformation)
      }
    );

    // Send the secure Cloudinary URL back to the frontend
    res.status(200).json({ imageURL: result.secure_url });
  } catch (error) {
    console.error("Cloudinary Backend Upload Error:", error);
    res
      .status(500)
      .json({ message: "Image upload failed.", error: error.message });
  }
});

module.exports = router;
