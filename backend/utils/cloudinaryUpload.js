const cloudinary = require("cloudinary").v2;
const { fileSizeFormatter } = require("./fileUpload");
const fs = require("fs");

// Upload image to Cloudinary
const uploadToCloudinary = async (file, folder = "StockMate") => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    console.log(`Uploading file: ${file.originalname} to Cloudinary folder: ${folder}`);

    // Upload to Cloudinary
    const uploadedFile = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
    });

    // Format file data
    const fileData = {
      fileName: file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: file.mimetype,
      fileSize: fileSizeFormatter(file.size, 2),
      publicId: uploadedFile.public_id, // Store public_id for potential deletion
    };

    // Delete temporary file
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`Deleted temporary file: ${file.path}`);
      }
    } catch (unlinkError) {
      console.error(`Failed to delete temporary file ${file.path}:`, unlinkError);
    }

    return fileData;
  } catch (error) {
    // Ensure temporary file is deleted on error
    try {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`Deleted temporary file on error: ${file.path}`);
      }
    } catch (unlinkError) {
      console.error(`Failed to delete temporary file on error ${file.path}:`, unlinkError);
    }
    console.error("Cloudinary upload error:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

module.exports = { uploadToCloudinary };