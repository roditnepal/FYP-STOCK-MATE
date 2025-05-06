import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/loader/Loader";
import ProductForm from "../../components/product/productForm/ProductForm";
import {
  getProduct,
  getProducts,
  selectIsLoading,
  selectProduct,
  updateProduct,
} from "../../redux/features/product/productSlice";
import { FiEdit2 } from "react-icons/fi";
import { toast } from "react-toastify";
import "./EditProduct.scss";

const initialState = {
  name: "",
  category: "",
  quantity: "",
  price: "",
  expiryDate: "",
};

const EditProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxIsLoading = useSelector(selectIsLoading);
  const productEdit = useSelector(selectProduct);
  const [product, setProduct] = useState(initialState);
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validate ID format
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Fetch product when component mounts
  useEffect(() => {
    if (!isValidObjectId(id)) {
      toast.error("Invalid product ID");
      navigate("/dashboard");
      return;
    }
    dispatch(getProduct(id));
  }, [dispatch, id, navigate]);

  // Update local state when product data is fetched
  useEffect(() => {
    if (productEdit) {
      setProduct({
        name: productEdit.name || "",
        category: productEdit.category || "",
        quantity: productEdit.quantity || "",
        price: productEdit.price || "",
        expiryDate: productEdit.expiryDate
          ? new Date(productEdit.expiryDate).toISOString().split("T")[0]
          : "",
      });
      setImagePreview(productEdit.image ? productEdit.image.filePath : null);
      setDescription(productEdit.description || "");
    }
  }, [productEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedFormats = ["image/png", "image/jpg", "image/jpeg"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedFormats.includes(file.type)) {
        toast.error("Unsupported file format. Please use JPG, JPEG, or PNG.");
        e.target.value = null;
        return;
      }
      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit.");
        e.target.value = null;
        return;
      }
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!product.name) return "Product name is required.";
    if (!product.category) return "Category is required.";
    if (!product.price || product.price <= 0) return "Price must be a positive number.";
    if (!product.quantity || product.quantity < 0) return "Quantity cannot be negative.";
    if (!product.expiryDate) return "Expiry date is required.";
    return null;
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("quantity", Number(product.quantity));
    formData.append("price", product.price);
    formData.append("description", description);
    if (product.expiryDate) {
      const formattedDate = new Date(product.expiryDate).toISOString();
      formData.append("expiryDate", formattedDate);
    }
    if (productImage) {
      formData.append("image", productImage);
    }

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const result = await dispatch(updateProduct({ id, formData })).unwrap();
      toast.success("Product updated successfully");
      await dispatch(getProducts());
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-product-page">
      {(isLoading || reduxIsLoading) && <Loader />}
      <div className="page-header">
        <h3>
          <FiEdit2 /> Edit Product
        </h3>
      </div>
      <ProductForm
        product={product}
        productImage={productImage}
        imagePreview={imagePreview}
        description={description}
        setDescription={setDescription}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        saveProduct={saveProduct}
        isEdit={true}
      />
    </div>
  );
};

export default EditProduct;