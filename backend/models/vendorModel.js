const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a vendor name'],
    trim: true,
  },
  contact: {
    type: String,
    required: [true, 'Please add a contact number'],
  },
  address: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
  ],
});

module.exports = mongoose.model('Vendor', vendorSchema);