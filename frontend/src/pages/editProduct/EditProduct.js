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
import "./EditProduct.scss";

const EditProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectIsLoading);

  const productEdit = useSelector(selectProduct);

  const [product, setProduct] = useState(null);
  const [productImage, setProductImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");

  // Fetch product when component mounts
  useEffect(() => {
    dispatch(getProduct(id));
  }, [dispatch, id]);

  // Update local state when product data is fetched
  useEffect(() => {
    if (productEdit) {
      setProduct({
        name: productEdit.name || "",
        category: productEdit.category?._id || productEdit.category || "",
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
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    // Validation
    if (!product) return;

    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("quantity", product.quantity);
    formData.append("price", product.price);
    formData.append("description", description);

    // Handle expiry date
    if (product.expiryDate) {
      formData.append("expiryDate", product.expiryDate);
    } else {
      formData.append("expiryDate", "");
    }

    if (productImage) {
      formData.append("image", productImage);
    }

    console.log("Updating product with data:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      await dispatch(updateProduct({ id, formData }));
      await dispatch(getProducts());
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="edit-product-page">
      {isLoading && <Loader />}

      <div className="page-header">
        <h3>
          <FiEdit2 /> Edit Product
        </h3>
      </div>

      {product && (
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
      )}
    </div>
  );
};

export default EditProduct;
