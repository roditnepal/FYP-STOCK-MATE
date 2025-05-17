import axios from "axios";

const API_URL = "http://localhost:8000/api/categories/";

// Create new category
const createCategory = async (categoryData) => {
  const response = await axios.post(API_URL, categoryData);
  return response.data;
};

// Get all categories
const getCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single category
const getCategory = async (id) => {
  const response = await axios.get(API_URL + id);
  return response.data;
};

// Delete category
const deleteCategory = async (id) => {
  const response = await axios.delete(API_URL + id);
  return response.data;
};

// Update category
const updateCategory = async (id, categoryData) => {
  const response = await axios.put(API_URL + id, categoryData);
  return response.data;
};

const categoryService = {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory,
};

export default categoryService;
