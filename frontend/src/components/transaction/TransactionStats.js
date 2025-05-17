import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactionStats } from "../../redux/features/transaction/transactionSlice";
import { SpinnerImg } from "../loader/Loader";
import "./Transaction.scss";
import { FaMoneyBillWave, FaShoppingCart, FaChartBar } from "react-icons/fa";
import moment from "moment";

// Import Recharts components
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TransactionStats = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.transaction);

  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(30, "days").toDate(),
    endDate: moment().toDate(),
  });

  // Load stats on component mount and when date range changes
  useEffect(() => {
    dispatch(getTransactionStats(dateRange));
  }, [dispatch, dateRange]);

  // Handle date change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: new Date(value),
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return "$" + parseFloat(amount).toFixed(2);
  };

  // Format date for input field
  const formatDateForInput = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  // Prepare data for Recharts (if stats are available)
  const topProductsData =
    stats?.topProducts?.map((item) => ({
      name: item.name,
      Revenue: parseFloat(item.totalRevenue),
    })) || [];
  const salesByPaymentMethodData =
    stats?.salesByPaymentMethod?.map((item) => ({
      name: item._id,
      value: parseFloat(item.total),
    })) || [];

  // Define colors for Pie Chart
  const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#9C27B0", "#FF5722"];

  return (
    <div className="transaction-stats">
      <div className="stats-header">
        <h3>Sales Statistics</h3>

        <div className="date-filter">
          <button
            className="--btn --btn-secondary"
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
          >
            {moment(dateRange.startDate).format("MMM D, YYYY")} -{" "}
            {moment(dateRange.endDate).format("MMM D, YYYY")}
          </button>

          {isDateFilterOpen && (
            <div className="date-inputs">
              <div className="date-input-group">
                <label>From:</label>
                <input
                  type="date"
                  name="startDate"
                  value={formatDateForInput(dateRange.startDate)}
                  onChange={handleDateChange}
                />
              </div>
              <div className="date-input-group">
                <label>To:</label>
                <input
                  type="date"
                  name="endDate"
                  value={formatDateForInput(dateRange.endDate)}
                  onChange={handleDateChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <SpinnerImg />
      ) : !stats ? (
        <p>No statistics available.</p>
      ) : (
        <div className="stats-content">
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-icon">
                <FaMoneyBillWave />
              </div>
              <div className="stat-info">
                <h4>Total Sales</h4>
                <h2>{formatCurrency(stats.totalSales)}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaShoppingCart />
              </div>
              <div className="stat-info">
                <h4>Total Transactions</h4>
                <h2>{stats.totalTransactions}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaChartBar />
              </div>
              <div className="stat-info">
                <h4>Avg. Transaction Value</h4>
                <h2>
                  {stats.totalTransactions > 0
                    ? formatCurrency(stats.totalSales / stats.totalTransactions)
                    : "$0.00"}
                </h2>
              </div>
            </div>
          </div>

          <div className="charts">
            {" "}
            {/* This container still uses the CSS layout */}
            {/* Bar Chart for Revenue by Product */}
            {topProductsData.length > 0 && (
              <div className="chart-container">
                {" "}
                {/* Keep this container for styling */}
                <h3>
                  <FaChartBar /> Revenue by Product
                </h3>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar
                      dataKey="Revenue"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Pie Chart for Sales by Payment Method */}
            {salesByPaymentMethodData.length > 0 && (
              <div className="chart-container">
                {" "}
                {/* Keep this container for styling */}
                <h3>
                  <FaChartBar /> Sales by Payment Method
                </h3>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={salesByPaymentMethodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {salesByPaymentMethodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionStats;
