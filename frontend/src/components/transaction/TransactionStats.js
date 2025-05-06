import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactionStats } from "../../redux/features/transaction/transactionSlice";
import { SpinnerImg } from "../loader/Loader";
import "./Transaction.scss";
import { FaMoneyBillWave, FaShoppingCart, FaChartBar } from "react-icons/fa";
import moment from "moment";

// Import Chart.js directly without react-chartjs-2
import Chart from "chart.js/auto";

const TransactionStats = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.transaction);

  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(30, "days").toDate(),
    endDate: moment().toDate(),
  });

  // References for chart canvases
  const barChartRef = React.useRef(null);
  const pieChartRef = React.useRef(null);

  // References for chart instances
  const barChartInstance = React.useRef(null);
  const pieChartInstance = React.useRef(null);

  // Load stats on component mount and when date range changes
  useEffect(() => {
    dispatch(getTransactionStats(dateRange));
  }, [dispatch, dateRange]);

  // Create/update charts when stats change
  useEffect(() => {
    if (
      stats &&
      stats.topProducts &&
      stats.topProducts.length > 0 &&
      barChartRef.current
    ) {
      // Destroy previous chart if it exists
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      const ctx = barChartRef.current.getContext("2d");

      // Prepare data for top products chart
      const labels = stats.topProducts.map((item) => item.name);
      const data = stats.topProducts.map((item) => item.totalRevenue);

      // Create new chart
      barChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Revenue by Product",
              data,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Revenue by Product",
            },
          },
        },
      });
    }

    if (
      stats &&
      stats.salesByPaymentMethod &&
      stats.salesByPaymentMethod.length > 0 &&
      pieChartRef.current
    ) {
      // Destroy previous chart if it exists
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      const ctx = pieChartRef.current.getContext("2d");

      // Prepare data for payment method chart
      const labels = stats.salesByPaymentMethod.map((item) => item._id);
      const data = stats.salesByPaymentMethod.map((item) => item.total);
      const backgroundColor = [
        "#4CAF50", // Green
        "#2196F3", // Blue
        "#FFC107", // Yellow
        "#9C27B0", // Purple
        "#FF5722", // Orange
      ];

      // Create new chart
      pieChartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              label: "Sales by Payment Method",
              data,
              backgroundColor,
              borderColor: backgroundColor,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Sales by Payment Method",
            },
          },
        },
      });
    }

    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, [stats]);

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

          <div className="stats-charts">
            <div className="chart-container">
              <h4>Top Selling Products</h4>
              {stats.topProducts && stats.topProducts.length > 0 ? (
                <canvas ref={barChartRef} />
              ) : (
                <p>No product data available.</p>
              )}
            </div>

            <div className="chart-container">
              <h4>Sales by Payment Method</h4>
              {stats.salesByPaymentMethod &&
              stats.salesByPaymentMethod.length > 0 ? (
                <canvas ref={pieChartRef} />
              ) : (
                <p>No payment method data available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionStats;
