import axios from "axios";
import { toast } from "react-toastify";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Get All Products
export const getProducts = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/products`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
    return [];
  }
};

// Get a Single Product
export const getProduct = async (id) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/products/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

// Delete Product
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/api/products/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

// Update Product
export const updateProduct = async (id, formData) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/products/${id}`,
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

// Create Product
export const createProduct = async (formData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/products`, formData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};
