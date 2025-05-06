import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api/transactions/`;

// Create Transaction
const createTransaction = async (formData) => {
  const response = await axios.post(API_URL, formData);
  return response.data;
};

// Get all transactions
const getTransactions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get a transaction
const getTransaction = async (id) => {
  const response = await axios.get(API_URL + id);
  return response.data;
};

// Get transaction statistics
const getTransactionStats = async (dateRange) => {
  let url = `${API_URL}stats`;

  // Add date range if provided
  if (dateRange && dateRange.startDate && dateRange.endDate) {
    url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
  }

  const response = await axios.get(url);
  return response.data;
};

const transactionService = {
  createTransaction,
  getTransactions,
  getTransaction,
  getTransactionStats,
};

export default transactionService;
export {
  createTransaction,
  getTransactions,
  getTransaction,
  getTransactionStats,
};
