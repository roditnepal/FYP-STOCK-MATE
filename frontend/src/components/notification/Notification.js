import React, { useState, useEffect, useCallback } from "react";
import { FaBell, FaSync, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./Notification.scss";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../../redux/features/auth/authSlice";
import { getExpiringProducts } from "../../redux/features/product/productService";
import { toast } from "react-toastify";
import ExpiringProductModal from "./ExpiringProductModal";

const Notification = () => {
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(false);
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

  useEffect(() => {
    fetchExpiringProducts();

    // Check every day for new expiring products
    const interval = setInterval(fetchExpiringProducts, 86400000);
    return () => clearInterval(interval);
  }, [fetchExpiringProducts]);

  // Get the first expiring product (if any)
  const firstExpiringProduct =
    expiringProducts.length > 0 ? expiringProducts[0] : null;

  const handleIconClick = () => {
    if (error) {
      // If there was an error, retry fetching
      fetchExpiringProducts();
      return;
    }

    if (expiringProducts.length > 0) {
      // If there are expiring products, show the first one in the modal
      setSelectedProduct(firstExpiringProduct);
      setShowModal(true);
    } else {
      // If no expiring products, just toggle the dropdown
      toggleDropdown();
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const closeDropdown = () => setIsOpen(false);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
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

  return (
    <div className="notification">
      <div
        className="notification-icon"
        onClick={handleIconClick}
      >
        {isLoading ? (
          <FaSync className="sync-icon" />
        ) : error ? (
          <FaSync className="sync-icon error" />
        ) : (
          <FaBell />
        )}
        {!isLoading && !error && expiringProducts.length > 0 && (
          <span className="notification-badge">{expiringProducts.length}</span>
        )}
        {error && <span className="notification-badge error-badge">!</span>}
      </div>

      {isOpen && !error && expiringProducts.length > 0 && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Products Expiring Soon</h4>
            <button
              className="close-btn"
              onClick={closeDropdown}
            >
              <FaTimes />
            </button>
          </div>
          {expiringProducts.map((product) => (
            <div
              key={product._id}
              className="notification-item"
              onClick={() => handleProductClick(product)}
            >
              <p>{product.name}</p>
              <p>Expires: {formatExpiryDate(product.expiryDate)}</p>
            </div>
          ))}
        </div>
      )}

      {isOpen && !error && expiringProducts.length === 0 && !isLoading && (
        <div className="notification-dropdown empty-dropdown">
          <div className="dropdown-header">
            <h4>No Expiring Products</h4>
            <button
              className="close-btn"
              onClick={closeDropdown}
            >
              <FaTimes />
            </button>
          </div>
          <div className="empty-notification">
            <FaInfoCircle className="info-icon" />
            <p>You don't have any products expiring in the next 6 months.</p>
          </div>
        </div>
      )}

      {isOpen && error && (
        <div className="notification-dropdown error-dropdown">
          <div className="dropdown-header">
            <h4>Error</h4>
            <button
              className="close-btn"
              onClick={closeDropdown}
            >
              <FaTimes />
            </button>
          </div>
          <p>Could not fetch expiring products</p>
          <button
            className="--btn --btn-primary retry-btn"
            onClick={handleRetry}
          >
            <FaSync /> Retry
          </button>
        </div>
      )}

      {showModal && firstExpiringProduct && (
        <ExpiringProductModal
          product={selectedProduct || firstExpiringProduct}
          onClose={closeModal}
          onViewAll={expiringProducts.length > 1 ? handleViewAllClick : null}
          formatExpiryDate={formatExpiryDate}
        />
      )}
    </div>
  );
};

export default Notification;
