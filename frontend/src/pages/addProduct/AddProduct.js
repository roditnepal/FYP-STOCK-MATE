import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loader/Loader";
import ProductForm from "../../components/product/productForm/ProductForm";
import {
  createProduct,
  selectIsLoading,
} from "../../redux/features/product/productSlice";
import { toast } from "react-toastify";

const initialState = {
  name: "",
  category: "",
  quantity: "",
  price: "",
  expiryDate: "",
};

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [product, setProduct] = useState(initialState);
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reduxIsLoading = useSelector(selectIsLoading);

  const { name, category, price, quantity, expiryDate } = product;

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
    if (!name) return "Product name is required.";
    if (!category) return "Category is required.";
    if (!price || price <= 0) return "Price must be a positive number.";
    if (!quantity || quantity < 0) return "Quantity cannot be negative.";
    if (!expiryDate) return "Expiry date is required.";
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
    formData.append("name", name);
    formData.append("category", category);
    formData.append("quantity", Number(quantity));
    formData.append("price", price);
    formData.append("description", description);
    formData.append("expiryDate", expiryDate);
    if (productImage) {
      formData.append("image", productImage);
    }

    try {
      const result = await dispatch(createProduct(formData)).unwrap();
      toast.success("Product added successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {(isLoading || reduxIsLoading) && <Loader />}
      <ProductForm
        product={product}
        productImage={productImage}
        imagePreview={imagePreview}
        description={description}
        setDescription={setDescription}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        saveProduct={saveProduct}
        isEdit={false}
      />
    </div>
  );
};

export default AddProduct;