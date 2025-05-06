import React from "react";
import "./Notification.scss";
import { FaTimes, FaList } from "react-icons/fa";

const ExpiringProductModal = ({
  product,
  onClose,
  onViewAll,
  formatExpiryDate,
}) => {
  if (!product) return null;

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
          <h3>Expiring Soon!</h3>
          <button
            className="close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="product-info">
            <h4>{product.name}</h4>
            <p className="expiry-date">
              <strong>Expires:</strong>{" "}
              {formatExpiryDate
                ? formatExpiryDate(product.expiryDate)
                : new Date(product.expiryDate).toLocaleDateString()}
            </p>
            {product.quantity && (
              <p>
                <strong>Quantity:</strong> {product.quantity}
              </p>
            )}
            {product.category && (
              <p>
                <strong>Category:</strong> {product.category}
              </p>
            )}
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
              <FaList className="btn-icon" /> View All Expiring
            </button>
          )}
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

export default ExpiringProductModal;
