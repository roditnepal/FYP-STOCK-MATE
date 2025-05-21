import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const API_URL = `${BACKEND_URL}/api/products/`;

// Create New Product
const createProduct = async (formData) => {
  const response = await axios.post(API_URL, formData);
  return response.data;
};

// Get all products
const getProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Delete a Product
const deleteProduct = async (id) => {
  const response = await axios.delete(API_URL + id);
  return response.data;
};
// Get a Product
const getProduct = async (id) => {
  const response = await axios.get(API_URL + id);
  return response.data;
};
// Update Product
const updateProduct = async (id, formData) => {
  const response = await axios.patch(`${API_URL}${id}`, formData);
  return response.data;
};

// Get Expiring Products
const getExpiringProducts = async () => {
  try {
    // Use a query parameter instead of a path parameter to avoid ObjectId casting error
    const response = await axios.get(`${API_URL}expiring`);
    return response.data;
  } catch (error) {
    console.error("Error in getExpiringProducts:", error);
    return [];
  }
};

// Get Low Stock Products
const getLowStockProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}low-stock`);
    return response.data;
  } catch (error) {
    console.error("Error in getLowStockProducts:", error);
    return [];
  }
};

// Get Products by Vendor
const getVendorProducts = async (vendorId) => {
  try {
    const response = await axios.get(`${API_URL}vendor/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getVendorProducts for vendor ${vendorId}:`, error);
    return [];
  }
};

const productService = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getExpiringProducts,
  getLowStockProducts,
  getVendorProducts,
};

export default productService;
export { getExpiringProducts };
