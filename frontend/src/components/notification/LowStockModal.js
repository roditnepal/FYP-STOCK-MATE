import React from "react";
import { FaEdit, FaList, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { formatNumbers } from "../../components/product/productSummary/ProductSummary";
import "./Notification.scss";

const LowStockModal = ({ product, onClose, onViewAll }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Low Stock Alert</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="product-info">
            <h4>{product.name}</h4>
            {product.image && product.image.filePath && (
              <img
                src={product.image.filePath}
                alt={product.name}
                className="product-image"
              />
            )}
            <p>
              <strong>Quantity:</strong>{" "}
              <span className="low-stock">{product.quantity}</span>
            </p>
            {product.category && (
              <p>
                <strong>Category:</strong> {product.category?.name || "N/A"}
              </p>
            )}
            {product.vendor && (
              <p>
                <strong>Vendor:</strong> {product.vendor?.name || "N/A"}
              </p>
            )}
            <p>
              <strong>Price:</strong> Rs. {formatNumbers(product.price)}
            </p>
            {product.description && (
              <div className="description">
                <strong>Description:</strong>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          {onViewAll && (
            <button
              className="--btn --btn-primary view-all-btn"
              onClick={onViewAll}
            >
              <FaList className="btn-icon" /> View All Low Stock
            </button>
          )}
          <Link
            to={`/edit-product/${product._id}`}
            className="--btn --btn-success"
          >
            <FaEdit className="btn-icon" /> Edit Product
          </Link>
          <button className="--btn --btn-danger" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockModal;
