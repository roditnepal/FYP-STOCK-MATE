const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      default: "SKU",
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please add a category"],
    },
    vendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: false,
      },
    ],
    quantity: {
      type: String,
      required: [true, "Please add a quantity"],
      trim: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    price: {
      type: String,
      required: [true, "Please add a price"],
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    isExpiringSoon: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
    editedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deletedBy: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
      },
      date: {
        type: Date,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add a method to check if product is expiring soon (within 30 days)
productSchema.methods.checkExpiringSoon = function () {
  if (!this.expiryDate) return false;

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow;
};

// Add method to check if product is low on stock
productSchema.methods.isLowOnStock = function () {
  const quantityNum = parseInt(this.quantity);
  if (isNaN(quantityNum)) return false;
  return quantityNum <= this.lowStockThreshold;
};

// Pre-save middleware to update isExpiringSoon
productSchema.pre("save", function (next) {
  if (this.expiryDate) {
    this.isExpiringSoon = this.checkExpiringSoon();
  }

  // Check if product needs to generate a low stock notification
  const quantityNum = parseInt(this.quantity);
  if (
    !isNaN(quantityNum) &&
    this.isModified("quantity") &&
    this.isLowOnStock()
  ) {
    this._lowStockNotificationNeeded = true;
  }

  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;