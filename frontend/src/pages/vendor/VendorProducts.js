import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiPackage,
  FiAlertCircle,
  FiPlus,
} from "react-icons/fi";
import vendorService from "../../services/vendorService";
import { formatNumbers } from "../../components/product/productSummary/ProductSummary";
import Loader from "../../components/loader/Loader";
import "./VendorProducts.scss";

const VendorProducts = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendorProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get vendor details
        const vendorData = await vendorService.getVendor(id);
        setVendor(vendorData);

        // Get vendor products
        const vendorWithProducts = await vendorService.getVendorsWithProducts();
        const currentVendor = vendorWithProducts.find((v) => v._id === id);

        if (currentVendor && currentVendor.products) {
          setProducts(currentVendor.products);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching vendor products:", error);
        setError("Failed to load vendor products. Please try again.");
        setIsLoading(false);
      }
    };

    fetchVendorProducts();
  }, [id]);

  // Check if a product is low on stock
  const isLowStock = (product) => {
    const quantity = parseInt(product.quantity);
    const threshold = product.lowStockThreshold || 10;
    return quantity <= threshold;
  };

  return (
    <div className="vendor-products-container">
      <div className="page-header">
        <h2>
          <FiPackage />{" "}
          {vendor ? `${vendor.name}'s Products` : "Vendor Products"}
        </h2>
        <div className="header-actions">
          <Link to="/dashboard" className="--btn --btn-primary">
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <Link to="/add-product" className="--btn --btn-success">
            <FiPlus /> Add New Product
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {vendor && (
            <div className="vendor-info-card">
              <div className="vendor-details">
                <h3>{vendor.name}</h3>
                <div className="vendor-contact">
                  <p>
                    <strong>Contact:</strong> {vendor.contact || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {vendor.email || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {vendor.address || "N/A"}
                  </p>
                </div>
              </div>
              <div className="vendor-stats">
                <div className="stat-box">
                  <span className="stat-value">{products.length}</span>
                  <span className="stat-label">Total Products</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">
                    {products.filter((p) => isLowStock(p)).length}
                  </span>
                  <span className="stat-label">Low Stock Items</span>
                </div>
              </div>
            </div>
          )}

          <div className="products-grid">
            {products.length === 0 ? (
              <div className="no-products">
                <p>No products found for this vendor</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className={`product-card ${
                    isLowStock(product) ? "low-stock" : ""
                  }`}
                >
                  <div className="product-image">
                    {product.image && product.image.filePath ? (
                      <img src={product.image.filePath} alt={product.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <div className="product-meta">
                      <p>
                        <strong>Category:</strong>{" "}
                        {product.category?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Price:</strong> Rs.{" "}
                        {formatNumbers(product.price)}
                      </p>
                      <p>
                        <strong>Quantity:</strong>{" "}
                        {formatNumbers(product.quantity)}
                        {isLowStock(product) && (
                          <span className="low-stock-badge">
                            <FiAlertCircle /> Low Stock
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="product-actions">
                      <Link
                        to={`/product-detail/${product._id}`}
                        className="--btn --btn-primary"
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit-product/${product._id}`}
                        className="--btn --btn-success"
                      >
                        <FiEdit /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VendorProducts;
