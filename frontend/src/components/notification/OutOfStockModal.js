import React from "react";
import "./Notification.scss";
import { FaTimes, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { formatNumbers } from "../product/productSummary/ProductSummary";

const OutOfStockModal = ({ products, onClose }) => {
  if (!products || products.length === 0) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Out of Stock Products</h3>
          <button
            className="close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="out-of-stock-list">
            {products.map((product) => (
              <div
                key={product._id}
                className="product-item"
              >
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <div className="product-details">
                    <p>
                      <strong>Category:</strong>{" "}
                      {product.category?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Price:</strong> Rs. {formatNumbers(product.price)}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {new Date(product.updatedAt).toLocaleString("en-US")}
                    </p>
                  </div>
                </div>
                <div className="product-actions">
                  <Link
                    to={`/edit-product/${product._id}`}
                    className="--btn --btn-primary"
                  >
                    <FaEdit className="btn-icon" /> Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="--btn --btn-danger"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutOfStockModal;
