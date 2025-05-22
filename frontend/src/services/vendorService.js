import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api/vendors/`;

// Get all vendors
const getVendors = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
};

// Get a single vendor
const getVendor = async (id) => {
  try {
    const response = await axios.get(API_URL + id);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vendor ${id}:`, error);
    throw error;
  }
};

// Get vendors with their products
const getVendorsWithProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}with-products`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors with products:", error);
    throw error;
  }
};

// Create a new vendor
const createVendor = async (vendorData) => {
  try {
    const response = await axios.post(API_URL, vendorData);
    return response.data;
  } catch (error) {
    console.error("Error creating vendor:", error);
    throw error;
  }
};

// Update a vendor
const updateVendor = async (id, vendorData) => {
  try {
    const response = await axios.put(`${API_URL}${id}`, vendorData);
    return response.data;
  } catch (error) {
    console.error(`Error updating vendor ${id}:`, error);
    throw error;
  }
};

// Delete a vendor
const deleteVendor = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting vendor ${id}:`, error);
    throw error;
  }
};

const vendorService = {
  getVendors,
  getVendor,
  getVendorsWithProducts,
  createVendor,
  updateVendor,
  deleteVendor,
};

export default vendorService;