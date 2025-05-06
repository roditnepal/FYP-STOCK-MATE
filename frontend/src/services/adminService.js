import axios from "axios";
import { toast } from "react-toastify";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Get All Users
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
    throw error;
  }
};

// Get Single User
export const getUser = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/admin/users/${userId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
    throw error;
  }
};

// Create User
export const createUser = async (userData) => {
  try {
    const config = {
      withCredentials: true,
      headers: {},
    };

    // If userData is FormData, don't set Content-Type (browser will set it with boundary)
    if (!(userData instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${BACKEND_URL}/api/admin/users`,
      userData,
      config
    );

    if (response.statusText === "OK" || response.status === 201) {
      toast.success("User created successfully");
    }
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
    throw error;
  }
};

// Update User
export const updateUser = async (userId, userData) => {
  try {
    const config = {
      withCredentials: true,
      headers: {},
    };

    // If userData is FormData, don't set Content-Type (browser will set it with boundary)
    if (!(userData instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    const response = await axios.patch(
      `${BACKEND_URL}/api/admin/users/${userId}`,
      userData,
      config
    );

    if (response.statusText === "OK") {
      toast.success("User updated successfully");
    }
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
    throw error;
  }
};

// Delete User
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/admin/users/${userId}`,
      { withCredentials: true }
    );
    if (response.statusText === "OK") {
      toast.success("User deleted successfully");
    }
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
    throw error;
  }
};
