const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a category name"],
      trim: true,
      unique: true, // Ensure no duplicate names
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    createdBy: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);