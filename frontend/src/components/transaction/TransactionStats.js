import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactionStats } from "../../redux/features/transaction/transactionSlice";
import { SpinnerImg } from "../loader/Loader";
import "./Transaction.scss";
import { FaMoneyBillWave, FaShoppingCart, FaChartBar } from "react-icons/fa";
import moment from "moment";
import * as XLSX from "xlsx";

// Import Recharts components
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
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
  const [reportType, setReportType] = useState("daily");

  // Load stats on component mount and when date range or report type changes
  useEffect(() => {
    dispatch(getTransactionStats({ ...dateRange, reportType }));
  }, [dispatch, dateRange, reportType]);

  // Handle date change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: new Date(value),
    });
  };

  // Handle report type change
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return "Rs " + parseFloat(amount || 0).toFixed(2);
  };

  // Format date for input field
  const formatDateForInput = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  // Prepare data for Recharts
  const topProductsData =
    stats?.topProducts?.map((item) => ({
      name: item.name || "Unknown",
      Revenue: parseFloat(item.totalRevenue || 0),
    })) || [];
  const salesByPaymentMethodData =
    stats?.salesByPaymentMethod?.map((item) => ({
      name: item._id || "Unknown",
      value: parseFloat(item.total || 0),
    })) || [];

  // Prepare data for sales report (daily, weekly, monthly)
  const getSalesReportData = () => {
    if (!stats?.transactions) return [];

    const salesData = {};
    stats.transactions.forEach((transaction) => {
      const date = moment(transaction.createdAt);
      let key;

      if (reportType === "daily") {
        key = date.format("YYYY-MM-DD");
      } else if (reportType === "weekly") {
        key = date.startOf("week").format("YYYY-MM-DD");
      } else if (reportType === "monthly") {
        key = date.startOf("month").format("YYYY-MM");
      }

      if (!salesData[key]) {
        salesData[key] = { date: key, totalSales: 0 };
      }
      salesData[key].totalSales += parseFloat(transaction.amount || 0);
    });

    return Object.values(salesData).sort((a, b) =>
      moment(a.date).diff(moment(b.date))
    );
  };

  // Prepare data for daily sales per product
  const getDailySalesPerProductData = () => {
    if (!stats?.transactions) return [];

    const salesData = {};
    stats.transactions.forEach((transaction) => {
      const date = moment(transaction.createdAt).format("YYYY-MM-DD");
      const product = transaction.productName || "Unknown Product";

      if (!salesData[date]) {
        salesData[date] = { date };
      }
      if (!salesData[date][product]) {
        salesData[date][product] = 0;
      }
      salesData[date][product] += parseFloat(transaction.amount || 0);
    });

    return Object.values(salesData).sort((a, b) =>
      moment(a.date).diff(moment(b.date))
    );
  };

  const salesReportData = getSalesReportData();
  const dailySalesPerProductData = getDailySalesPerProductData();

  // Get unique products for dynamic Bar colors
  const uniqueProducts = [
    ...new Set(
      stats?.transactions?.map((t) => t.productName || "Unknown Product") || []
    ),
  ];
  const COLORS = [
    "#4CAF50",
    "#2196F3",
    "#FFC107",
    "#9C27B0",
    "#FF5722",
    "#00BCD4",
    "#E91E63",
  ];

  // Export to Excel
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ["Metric", "Value"],
        ["Total Sales", formatCurrency(stats?.totalSales || 0)],
        ["Total Transactions", stats?.totalTransactions || 0],
        [
          "Average Transaction Value",
          stats?.totalTransactions > 0
            ? formatCurrency(stats.totalSales / stats.totalTransactions)
            : "Rs 0.00",
        ],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

      // Top Products Sheet
      const topProductsSheetData = [
        ["Product", "Revenue"],
        ...topProductsData.map((item) => [
          item.name,
          formatCurrency(item.Revenue),
        ]),
      ];
      const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsSheetData);
      XLSX.utils.book_append_sheet(wb, topProductsSheet, "Top Products");

      // Sales by Payment Method Sheet
      const paymentMethodSheetData = [
        ["Payment Method", "Total"],
        ...salesByPaymentMethodData.map((item) => [
          item.name,
          formatCurrency(item.value),
        ]),
      ];
      const paymentMethodSheet = XLSX.utils.aoa_to_sheet(paymentMethodSheetData);
      XLSX.utils.book_append_sheet(wb, paymentMethodSheet, "Payment Methods");

      // Daily Sales per Product Sheet
      const dailySalesSheetData = [
        ["Date", ...uniqueProducts],
        ...dailySalesPerProductData.map((item) => [
          item.date,
          ...uniqueProducts.map((product) =>
            item[product] ? formatCurrency(item[product]) : "Rs 0.00"
          ),
        ]),
      ];
      const dailySalesSheet = XLSX.utils.aoa_to_sheet(dailySalesSheetData);
      XLSX.utils.book_append_sheet(wb, dailySalesSheet, "Daily Sales by Product");

      // Download Excel file
      XLSX.writeFile(wb, `Sales_Stats_${moment().format("YYYY-MM-DD")}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
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
          <button className="--btn --btn-primary" onClick={exportToExcel}>
            Export to Excel
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
              <div className="date-input-group">
                <label>Report Type:</label>
                <select value={reportType} onChange={handleReportTypeChange}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
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
                    : "Rs 0.00"}
                </h2>
              </div>
            </div>
          </div>

          <div className="charts">
            {/* Bar Chart for Revenue by Product */}
            {topProductsData.length > 0 && (
              <div className="chart-container">
                <h3>
                  <FaChartBar /> Revenue by Product
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Pie Chart for Sales by Payment Method */}
            {salesByPaymentMethodData.length > 0 && (
              <div className="chart-container">
                <h3>
                  <FaChartBar /> Sales by Payment Method
                </h3>
                <ResponsiveContainer width="100%" height={400}>
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
            {/* Line Chart for Sales Report */}
            {salesReportData.length > 0 && (
              <div className="chart-container">
                <h3>
                  <FaChartBar />{" "}
                  {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Sales
                  Report
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={salesReportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        reportType === "monthly"
                          ? moment(date).format("MMM YYYY")
                          : moment(date).format("MMM D, YYYY")
                      }
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      stroke="#4CAF50"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Bar Chart for Daily Sales per Product */}
            {dailySalesPerProductData.length > 0 && (
              <div className="chart-container">
                <h3>
                  <FaChartBar /> Daily Sales by Product
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailySalesPerProductData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => moment(date).format("MMM D, YYYY")}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    {uniqueProducts.map((product, index) => (
                      <Bar
                        key={product}
                        dataKey={product}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </BarChart>
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