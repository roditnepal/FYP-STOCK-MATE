import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { FiBox, FiInfo, FiArrowLeft } from "react-icons/fi";
import useRedirectLoggedOutUser from "../../../customHook/useRedirectLoggedOutUser";
import {
  selectIsLoggedIn,
  selectIsAdmin,
} from "../../../redux/features/auth/authSlice";
import { getProduct } from "../../../redux/features/product/productSlice";
import Card from "../../card/Card";
import { SpinnerImg } from "../../loader/Loader";
import "./ProductDetail.scss";
import DOMPurify from "dompurify";
import { formatNumbers } from "../productSummary/ProductSummary";

const ProductDetail = () => {
  useRedirectLoggedOutUser("/login");
  const dispatch = useDispatch();

  const { id } = useParams();

  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isAdmin = useSelector(selectIsAdmin);
  const { product, isLoading, isError, message } = useSelector(
    (state) => state.product
  );

  const stockStatus = (quantity) => {
    if (quantity > 0) {
      return <span className="in-stock">In Stock</span>;
    }
    return <span className="out-of-stock">Out Of Stock</span>;
  };

  useEffect(() => {
    if (isLoggedIn === true) {
      dispatch(getProduct(id));
    }

    if (isError) {
      console.log(message);
    }
  }, [isLoggedIn, isError, message, dispatch, id]);

  return (
    <div className="product-detail">
      <div className="page-header">
        <h3>
          <FiBox /> Product Detail
        </h3>
      </div>

      <Card cardClass="card">
        {isLoading && <SpinnerImg />}
        {product && (
          <div className="detail">
            <div className="product-image">
              {product?.image ? (
                <img
                  src={product.image.filePath}
                  alt={product.image.fileName}
                />
              ) : (
                <p>No image available for this product</p>
              )}
            </div>

            <div className="product-info">
              <div className="availability">
                Product Availability: {stockStatus(product.quantity)}
              </div>

              <h2 className="product-name">{product.name}</h2>

              <div className="product-meta">
                <div className="meta-item">
                  <span className="label">SKU:</span>
                  <span className="value">{product.sku}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Category:</span>
                  <span className="value">
                    {product.category?.name || "N/A"}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Price:</span>
                  <span className="value">
                    Rs. {formatNumbers(product.price)}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Quantity:</span>
                  <span className="value">
                    {formatNumbers(product.quantity)}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Total Value:</span>
                  <span className="value">
                    Rs. {formatNumbers(product.price * product.quantity)}
                  </span>
                </div>
              </div>

              {product.description && (
                <div className="product-description">
                  <h4>Description</h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                  ></div>
                </div>
              )}

              <div className="product-timestamps">
                <div className="timestamp">
                  <strong>Created on:</strong>{" "}
                  {new Date(product.createdAt).toLocaleString("en-US")}
                </div>
                <div className="timestamp">
                  <strong>Last Updated:</strong>{" "}
                  {new Date(product.updatedAt).toLocaleString("en-US")}
                </div>
              </div>

              {/* Admin-only information */}
              {isAdmin && (
                <div className="admin-info">
                  <h4>Product History</h4>

                  {product.createdBy && (
                    <div className="history-item">
                      <h5>Created By</h5>
                      <p>
                        <strong>User:</strong> {product.createdBy.name}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(product.createdAt).toLocaleString("en-US")}
                      </p>
                    </div>
                  )}

                  {product.editedBy && product.editedBy.length > 0 && (
                    <div className="history-item">
                      <h5>Edit History</h5>
                      <ul>
                        {product.editedBy.map((edit, index) => (
                          <li key={index}>
                            <p>
                              <strong>User:</strong> {edit.name}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(edit.date).toLocaleString("en-US")}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.isDeleted && product.deletedBy && (
                    <div className="history-item">
                      <h5>Deleted By</h5>
                      <p>
                        <strong>User:</strong> {product.deletedBy.name}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(product.deletedBy.date).toLocaleString(
                          "en-US"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="action-buttons">
                <Link
                  to="/dashboard"
                  className="--btn --btn-primary"
                >
                  <FiArrowLeft /> Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductDetail;
