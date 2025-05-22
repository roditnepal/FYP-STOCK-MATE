import React, { useState } from "react";
import { FaEdit, FaList, FaTimes, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import Select from "react-select";
import { formatNumbers } from "../../components/product/productSummary/ProductSummary";
import { sendEmailToVendors } from "../../services/productService";
import { toast } from "react-toastify";
import "./Notification.scss";

const LowStockModal = ({ product, onClose, onViewAll }) => {
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // Prepare vendor options for react-select
  const vendorOptions = product.vendors?.map((vendor) => ({
    value: vendor._id,
    label: vendor.name,
  })) || [];

  const handleSendEmail = async () => {
    if (selectedVendors.length === 0) {
      toast.error("Please select at least one vendor");
      return;
    }

    setIsSending(true);
    try {
      const vendorIds = selectedVendors.map((vendor) => vendor.value);
      await sendEmailToVendors(product._id, vendorIds);
      setSelectedVendors([]); // Clear selection after sending
    } catch (error) {
      console.error("Error sending emails:", error);
    } finally {
      setIsSending(false);
    }
  };

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
            {product.vendors && product.vendors.length > 0 && (
              <p>
                <strong>Vendors:</strong>{" "}
                {product.vendors.map((v) => v.name).join(", ") || "N/A"}
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
            {product.vendors && product.vendors.length > 0 && (
              <div className="vendor-select">
                <strong>Select Vendors to Notify:</strong>
                <Select
                  isMulti
                  options={vendorOptions}
                  value={selectedVendors}
                  onChange={setSelectedVendors}
                  placeholder="Select vendors..."
                  className="vendor-select-dropdown"
                />
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          {product.vendors && product.vendors.length > 0 && (
            <button
              className="--btn --btn-primary"
              onClick={handleSendEmail}
              disabled={isSending}
            >
              <FaEnvelope className="btn-icon" />{" "}
              {isSending ? "Sending..." : "Send Email to Vendors"}
            </button>
          )}
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