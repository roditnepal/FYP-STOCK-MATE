const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  console.log("Creating uploads directory...");
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("=== File Upload Middleware ===");
    console.log("Setting upload destination to:", path.resolve(uploadDir));
    console.log("Directory exists:", fs.existsSync(uploadDir));
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log("Processing file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // Sanitize filename
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${sanitizedFilename}`;
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

// Specify file format that can be saved
function fileFilter(req, file, cb) {
  console.log("Checking file type:", {
    mimetype: file.mimetype,
    originalname: file.originalname,
  });

  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    console.log("File type accepted:", file.mimetype);
    cb(null, true);
  } else {
    console.log("File type rejected:", file.mimetype);
    cb(
      new Error(
        `Invalid file type. Only ${allowedTypes.join(", ")} are allowed.`
      ),
      false
    );
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single("image");

// Wrap multer middleware to handle errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File size too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      console.log("No file uploaded");
      return next();
    }

    console.log("File uploaded successfully:", {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
    next();
  });
};

// File Size Formatter
const fileSizeFormatter = (bytes, decimal) => {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const dm = decimal || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    parseFloat((bytes / Math.pow(1024, index)).toFixed(dm)) + " " + sizes[index]
  );
};

module.exports = { uploadMiddleware, fileSizeFormatter };
