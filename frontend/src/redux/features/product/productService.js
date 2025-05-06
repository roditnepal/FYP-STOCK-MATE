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
    const response = await axios.get(`${API_URL}`, {
      params: { expiring: true },
      timeout: 10000, // 10 second timeout
    });

    // Validate response data
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error(
        "Invalid response format from expiring products API:",
        response.data
      );
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error fetching expiring products:", error.message);
    // Re-throw the error to be handled by the component
    throw error;
  }
};

const productService = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getExpiringProducts,
};

export default productService;
export { getExpiringProducts };
