import React, { useState, useEffect, useCallback } from "react";
import { FaBell, FaSync, FaInfoCircle, FaTimes, FaList } from "react-icons/fa";
import { FiAlertTriangle, FiBox } from "react-icons/fi";
import "./Notification.scss";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../../redux/features/auth/authSlice";
import { getExpiringProducts } from "../../redux/features/product/productService";
import productService from "../../redux/features/product/productService";
import { toast } from "react-toastify";
import ExpiringProductModal from "./ExpiringProductModal";
import { Link } from "react-router-dom";
import LowStockModal from "./LowStockModal";

const Notification = () => {
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("expiring"); // 'expiring' or 'lowstock'
  const [modalType, setModalType] = useState("expiring"); // 'expiring' or 'lowstock'
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // Function to filter products expiring within 6 months
  const filterExpiringProducts = (products) => {
    if (!Array.isArray(products)) return [];

    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);

    return products.filter((product) => {
      // Skip products without expiry date
      if (!product.expiryDate) return false;

      const expiryDate = new Date(product.expiryDate);
      // Check if expiry date is valid and within 6 months
      return (
        !isNaN(expiryDate) &&
        expiryDate > today &&
        expiryDate <= sixMonthsFromNow
      );
    });
  };

  const fetchExpiringProducts = useCallback(async () => {
    if (isLoggedIn) {
      try {
        setIsLoading(true);
        setError(false);
        const products = await getExpiringProducts();

        // Check if products is valid array
        if (Array.isArray(products)) {
          // Filter products expiring within 6 months
          const filteredProducts = filterExpiringProducts(products);

          // Sort filtered products by expiry date (ascending)
          const sortedProducts = filteredProducts.sort(
            (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
          );

          setExpiringProducts(sortedProducts);
        } else {
          // Handle case where response is not an array
          console.error("Invalid response format:", products);
          setExpiringProducts([]);
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching expiring products:", error);
        setError(true);
        setExpiringProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn]);

  const fetchLowStockProducts = useCallback(async () => {
    if (isLoggedIn) {
      try {
        setIsLoading(true);
        setError(false);
        const products = await productService.getLowStockProducts();

        if (Array.isArray(products)) {
          setLowStockProducts(products);
        } else {
          console.error(
            "Invalid response format for low stock products:",
            products
          );
          setLowStockProducts([]);
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching low stock products:", error);
        setError(true);
        setLowStockProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchExpiringProducts();
    fetchLowStockProducts();

    // Check for new expiring products daily
    const expiringInterval = setInterval(fetchExpiringProducts, 86400000);

    // Check low stock products every 5 minutes
    const lowStockInterval = setInterval(fetchLowStockProducts, 5 * 60 * 1000);

    return () => {
      clearInterval(expiringInterval);
      clearInterval(lowStockInterval);
    };
  }, [fetchExpiringProducts, fetchLowStockProducts]);

  // Get the first products from each category (if any)
  const firstExpiringProduct =
    expiringProducts.length > 0 ? expiringProducts[0] : null;
  const firstLowStockProduct =
    lowStockProducts.length > 0 ? lowStockProducts[0] : null;

  // Get total notification count
  const notificationCount = expiringProducts.length + lowStockProducts.length;

  const handleIconClick = () => {
    if (error) {
      // If there was an error, retry fetching
      fetchExpiringProducts();
      fetchLowStockProducts();
      return;
    }

    if (notificationCount > 0) {
      // Toggle dropdown to show notifications
      toggleDropdown();
    } else {
      // If no notifications, just toggle the dropdown
      toggleDropdown();
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const closeDropdown = () => setIsOpen(false);

  const handleProductClick = (product, type) => {
    setSelectedProduct(product);
    setModalType(type);
    setShowModal(true);
    setIsOpen(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleViewAllClick = (e) => {
    e.stopPropagation();
    setShowModal(false);
    setIsOpen(true);
  };

  const handleRetry = () => {
    fetchExpiringProducts();
    fetchLowStockProducts();
  };

  // Format expiry date with time remaining
  const formatExpiryDate = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();

    // Calculate difference in days
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Format the date
    const formattedDate = expiryDate.toLocaleDateString();

    if (diffDays <= 30) {
      return `${formattedDate} (${diffDays} days left)`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${formattedDate} (${months} months left)`;
    }
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
    <div className="notification">
      <div className="notification-icon" onClick={handleIconClick}>
        {isLoading ? (
          <FaSync className="sync-icon" />
        ) : error ? (
          <FaSync className="sync-icon error" />
        ) : (
          <FaBell />
        )}
        {!isLoading && !error && notificationCount > 0 && (
          <span className="notification-badge">{notificationCount}</span>
        )}
        {error && <span className="notification-badge error-badge">!</span>}
      </div>

      {isOpen && !error && (
        <div className="notification-dropdown notification-combined">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            <button className="close-btn" onClick={closeDropdown}>
              <FaTimes />
            </button>
          </div>

          <div className="notification-tabs">
            <button
              className={`tab-btn ${activeTab === "expiring" ? "active" : ""}`}
              onClick={() => setActiveTab("expiring")}
            >
              <FiAlertTriangle />
              Expiring Soon
              {expiringProducts.length > 0 && (
                <span className="tab-badge">{expiringProducts.length}</span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === "lowstock" ? "active" : ""}`}
              onClick={() => setActiveTab("lowstock")}
            >
              <FiBox />
              Low Stock
              {lowStockProducts.length > 0 && (
                <span className="tab-badge">{lowStockProducts.length}</span>
              )}
            </button>
          </div>

          <div className="notification-body">
            {/* Expiring Products Tab Content */}
            {activeTab === "expiring" && (
              <div className="tab-content">
                {isLoading ? (
                  <div className="loading-notification">Loading...</div>
                ) : expiringProducts.length === 0 ? (
                  <div className="empty-notification">
                    <FaInfoCircle className="info-icon" />
                    <p>
                      You don't have any products expiring in the next 6 months.
                    </p>
                  </div>
                ) : (
                  <>
                    {expiringProducts.map((product) => (
                      <div
                        key={product._id}
                        className="notification-item"
                        onClick={() => handleProductClick(product, "expiring")}
                      >
                        <p className="product-name">{product.name}</p>
                        <p className="expiry-date">
                          Expires: {formatExpiryDate(product.expiryDate)}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Low Stock Tab Content */}
            {activeTab === "lowstock" && (
              <div className="tab-content">
                {isLoading ? (
                  <div className="loading-notification">Loading...</div>
                ) : lowStockProducts.length === 0 ? (
                  <div className="empty-notification">
                    <FaInfoCircle className="info-icon" />
                    <p>No low stock alerts at the moment.</p>
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
                        onClick={() => handleProductClick(product, "lowstock")}
                      >
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
                          </div>

                          <div className="stock-bar-container">
                            <div
                              className="stock-bar"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (product.quantity /
                                    product.lowStockThreshold) *
                                    100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Footer with relevant action for current tab */}
          {activeTab === "expiring" && expiringProducts.length > 0 && (
            <div className="notification-footer">
              <Link
                to="/dashboard"
                className="view-all"
                onClick={closeDropdown}
              >
                <FaList /> View All Expiring Products
              </Link>
            </div>
          )}

          {activeTab === "lowstock" && lowStockProducts.length > 0 && (
            <div className="notification-footer">
              <Link
                to="/dashboard"
                className="view-all"
                onClick={closeDropdown}
              >
                <FaList /> View All Low Stock Products
              </Link>
            </div>
          )}
        </div>
      )}

      {isOpen && error && (
        <div className="notification-dropdown error-dropdown">
          <div className="dropdown-header">
            <h4>Error</h4>
            <button className="close-btn" onClick={closeDropdown}>
              <FaTimes />
            </button>
          </div>
          <p>Could not fetch notifications</p>
          <button
            className="--btn --btn-primary retry-btn"
            onClick={handleRetry}
          >
            <FaSync /> Retry
          </button>
        </div>
      )}

      {showModal && modalType === "expiring" && selectedProduct && (
        <ExpiringProductModal
          product={selectedProduct}
          onClose={closeModal}
          onViewAll={expiringProducts.length > 1 ? handleViewAllClick : null}
          formatExpiryDate={formatExpiryDate}
        />
      )}

      {showModal && modalType === "lowstock" && selectedProduct && (
        <LowStockModal
          product={selectedProduct}
          onClose={closeModal}
          onViewAll={lowStockProducts.length > 1 ? handleViewAllClick : null}
        />
      )}
    </div>
  );
};

export default Notification;
