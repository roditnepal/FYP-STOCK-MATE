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
} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./ProductForm.scss";
import categoryService from "../../../services/categoryService";

const ProductForm = ({
  product,
  productImage,
  imagePreview,
  description,
  setDescription,
  handleInputChange,
  handleImageChange,
  saveProduct,
  isEdit,
}) => {
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    fetchCategories();
  }, []);

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
                <img
                  src={imagePreview}
                  alt="product"
                />
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
              <option
                value=""
                disabled
              >
                Select a category
              </option>
              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
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
              required
            />
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
