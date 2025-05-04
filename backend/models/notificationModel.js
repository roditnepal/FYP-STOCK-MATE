
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
