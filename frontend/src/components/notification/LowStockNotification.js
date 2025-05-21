import React, { useState, useEffect, useCallback } from "react";
import { FiBox, FiAlertTriangle } from "react-icons/fi";
import productService from "../../redux/features/product/productService";
import { Link } from "react-router-dom";
import "./Notification.scss";

const LowStockNotification = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLowStockProducts = useCallback(async () => {
    setLoading(true);
    try {
      const products = await productService.getLowStockProducts();
      setLowStockProducts(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStockProducts();

    // Set up interval to check for low stock products every 5 minutes
    const interval = setInterval(fetchLowStockProducts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchLowStockProducts]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getStockLevel = (quantity, threshold) => {
    const stockPercentage = (quantity / threshold) * 100;

    if (stockPercentage <= 30) {
      return "critical";
    } else if (stockPercentage <= 70) {
      return "warning";
    } else {
      return "normal";
    }
  };

  return (
    <div className={`notification-container ${showDropdown ? "active" : ""}`}>
      <div className="notification-icon" onClick={toggleDropdown}>
        <FiBox />
        {lowStockProducts.length > 0 && (
          <span className="count">{lowStockProducts.length}</span>
        )}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>
              <FiAlertTriangle /> Low Stock Alerts
            </h3>
          </div>

          <div className="notification-body">
            {loading ? (
              <div className="loading-notification">Loading alerts...</div>
            ) : lowStockProducts.length === 0 ? (
              <div className="no-notifications">
                <p>No low stock alerts at the moment</p>
              </div>
            ) : (
              <ul className="notification-list">
                {lowStockProducts.map((product) => (
                  <li
                    key={product._id}
                    className={`notification-item ${getStockLevel(
                      product.quantity,
                      product.lowStockThreshold
                    )}`}
                  >
                    <Link to={`/product-detail/${product._id}`}>
                      <div className="notification-content">
                        <div className="notification-header">
                          <h4>{product.name}</h4>
                          <span className="stock-badge">
                            {product.quantity} left
                          </span>
                        </div>

                        <div className="notification-details">
                          <p>
                            <strong>Threshold:</strong>{" "}
                            {product.lowStockThreshold}
                          </p>

                          {product.vendor && (
                            <p>
                              <strong>Vendor:</strong>{" "}
                              {product.vendor.name || "Unknown"}
                            </p>
                          )}
                        </div>

                        <div className="stock-bar-container">
                          <div
                            className="stock-bar"
                            style={{
                              width: `${Math.min(
                                100,
                                (product.quantity / product.lowStockThreshold) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {lowStockProducts.length > 0 && (
            <div className="notification-footer">
              <Link to="/dashboard" className="view-all">
                View All Low Stock Products
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LowStockNotification;
