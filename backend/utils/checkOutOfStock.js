
const Product = require('./productModel');
const Notification = require('./notificationModel');

const checkOutOfStockProducts = async () => {
  const outOfStockProducts = await Product.find({ quantity: 0 });
  
  if (outOfStockProducts.length > 0) {
    outOfStockProducts.forEach(async (product) => {
      const notification = new Notification({
        message: `Product ${product.name} is out of stock. Please restock it.`,
        productId: product._id,
      });
      await notification.save();
    });
  }
};

module.exports = checkOutOfStockProducts;
