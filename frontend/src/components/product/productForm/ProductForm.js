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
import { getProducts } from "../../../services/productService";
import { toast } from "react-toastify";

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
  const [imageError, setImageError] = useState(null);

  // Fetch available categories from products
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const products = await getProducts();
      const uniqueCategories = [
        ...new Set(products.map((product) => product.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch categories");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Validate image file before preview
  const validateImage = (file) => {
    const allowedFormats = ["image/png", "image/jpg", "image/jpeg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedFormats.includes(file.type)) {
      return "Unsupported file format. Please use JPG, JPEG, or PNG.";
    }
    if (file.size > maxSize) {
      return "File size exceeds 5MB limit.";
    }
    return null;
  };

  // Handle image change with validation
  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        setImageError(error);
        e.target.value = null; // Reset input
        return;
      }
      setImageError(null);
      handleImageChange(e);
    }
  };

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
            <p className="formats">Supported formats: jpg, jpeg, png (max 5MB)</p>
            <input
              type="file"
              name="image"
              onChange={onImageChange}
              accept="image/png,image/jpg,image/jpeg"
            />
            {imageError && <p className="error">{imageError}</p>}
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
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))
              ) : (
                <>
                  <option value="Electronics">Electronics</option>
                  <option value="Food">Food</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Others">Others</option>
                </>
              )}
              {categories.length > 0 && !categories.includes("Others") && (
                <option value="Others">Others</option>
              )}
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
            <button type="submit">{isEdit ? "Update Product" : "Add Product"}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;