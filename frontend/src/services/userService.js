import axios from "axios";

const API_URL = "http://localhost:8000/api/users/";

// Get all users
const getUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single user
const getUser = async (id) => {
  const response = await axios.get(API_URL + id);
  return response.data;
};

// Create user
const createUser = async (userData) => {
  const response = await axios.post(API_URL, userData);
  return response.data;
};

// Update user
const updateUser = async (id, userData) => {
  const response = await axios.put(API_URL + id, userData);
  return response.data;
};

// Delete user
const deleteUser = async (id) => {
  const response = await axios.delete(API_URL + id);
  return response.data;
};

const userService = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
