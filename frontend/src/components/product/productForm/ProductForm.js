import React, { useState, useEffect } from "react";
import Loader from "../../loader/Loader";
import {
  FiPackage,
  FiUpload,
  FiDollarSign,
  FiBox,
  FiCalendar,
  FiTag,
  FiGrid,
  FiFileText,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import "./ProductForm.scss";
import categoryService from "../../../services/categoryService";
import vendorService from "../../../services/vendorService";

const ProductForm = ({
  product,
  productImage,
  imagePreview,
  description,
  setDescription,
  handleInputChange,
  handleImageChange,
  handleVendorChange,
  saveProduct,
  isEdit,
}) => {
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setIsLoading(false);
    }
  };

  // Fetch vendors
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const data = await vendorService.getVendors();
      setVendors(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, []);

  const vendorOptions = vendors.map((vendor) => ({
    value: vendor._id,
    label: vendor.name,
  }));

  const selectedVendors = product?.vendors
    ? product.vendors.map((id) =>
        vendorOptions.find((option) => option.value === id)
      ).filter(Boolean)
    : [];

  return (
    <div className="add-product">
      <div className="form-title">
        <FiPackage size={28} />
        <h2>{isEdit ? "Edit Product" : "Add New Product"}</h2>
      </div>

      {isLoading && <Loader />}

      <form onSubmit={saveProduct}>
        <div className="form-left">
          <div className="image-upload">
            <label>
              <FiUpload size={18} />
              <div>Product Image</div>
            </label>
            <p className="formats">Supported formats: jpg, jpeg, png</p>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
            />
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="product" />
              </div>
            ) : (
              <div className="image-preview">
                <p>No image selected</p>
              </div>
            )}
          </div>
        </div>

        <div className="form-right">
          <div className="form-group">
            <label>
              <FiTag size={18} /> Product Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              name="name"
              value={product?.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiGrid size={18} /> Category
            </label>
            <select
              name="category"
              value={product?.category || ""}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <FiUser size={18} /> Vendors
            </label>
            <Select
              isMulti
              options={vendorOptions}
              value={selectedVendors}
              onChange={(selected) =>
                handleVendorChange(selected.map((option) => option.value))
              }
              placeholder="Select vendors..."
            />
            <small className="form-text">
              Optional: Select multiple vendors or leave empty for internal products
            </small>
          </div>

          <div className="form-group">
            <label>
              <FiDollarSign size={18} /> Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter price"
              name="price"
              value={product?.price || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiBox size={18} /> Quantity
            </label>
            <input
              type="number"
              min="0"
              placeholder="Enter quantity"
              name="quantity"
              value={product?.quantity || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiAlertCircle size={18} /> Low Stock Threshold
            </label>
            <input
              type="number"
              min="1"
              placeholder="Low stock alert threshold"
              name="lowStockThreshold"
              value={product?.lowStockThreshold || "10"}
              onChange={handleInputChange}
            />
            <small className="form-text">
              Get notified when stock falls below this number
            </small>
          </div>

          <div className="form-group">
            <label>
              <FiCalendar size={18} /> Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={
                product?.expiryDate
                  ? new Date(product.expiryDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
            />
            <small className="form-text">
              Optional: Leave empty if product does not expire
            </small>
          </div>

          <div className="description-group">
            <label>
              <FiFileText size={18} /> Product Description
            </label>
            <ReactQuill
              theme="snow"
              value={description || ""}
              onChange={setDescription}
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["clean"],
                ],
              }}
              placeholder="Enter product description..."
            />
          </div>

          <div className="submit-btn">
            <button type="submit">
              {isEdit ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;