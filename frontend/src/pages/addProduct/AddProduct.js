import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loader/Loader";
import ProductForm from "../../components/product/productForm/ProductForm";
import {
  createProduct,
  selectIsLoading,
} from "../../redux/features/product/productSlice";
import vendorService from "../../services/vendorService";

const initialState = {
  name: "",
  category: "",
  quantity: "",
  price: "",
  description: "",
  expiryDate: "",
  vendors: [], // Changed from vendor to vendors array
  lowStockThreshold: "10",
};

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [product, setProduct] = useState(initialState);
  const [productImage, setProductImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [availableVendors, setAvailableVendors] = useState([]);

  const isLoading = useSelector(selectIsLoading);

  // Fetch vendors on mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendors = await vendorService.getVendors();
        setAvailableVendors(vendors);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  const { name, category, price, quantity, expiryDate, vendors, lowStockThreshold } = product;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleVendorChange = (selectedVendors) => {
    setProduct({ ...product, vendors: selectedVendors });
  };

  const handleImageChange = (e) => {
    setProductImage(e.target.files[0]);
    setImagePreview(URL.createObjectURL(e.target.files[0]));
  };

  const generateKSKU = (category) => {
    const letter = category.slice(0, 3).toUpperCase();
    const number = Date.now();
    const sku = letter + "-" + number;
    return sku;
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", generateKSKU(category));
    formData.append("category", category);
    formData.append("quantity", Number(quantity));
    formData.append("price", price);
    formData.append("description", description);
    formData.append("lowStockThreshold", Number(lowStockThreshold));

    if (expiryDate) {
      formData.append("expiryDate", expiryDate);
    }

    if (vendors.length > 0) {
      formData.append("vendors", JSON.stringify(vendors));
    }

    if (productImage) {
      formData.append("image", productImage);
    }

    console.log(...formData);

    await dispatch(createProduct(formData));

    navigate("/dashboard");
  };

  return (
    <div>
      {isLoading && <Loader />}
      <ProductForm
        product={product}
        productImage={productImage}
        imagePreview={imagePreview}
        description={description}
        setDescription={setDescription}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleVendorChange={handleVendorChange}
        saveProduct={saveProduct}
        availableVendors={availableVendors}
      />
    </div>
  );
};

export default AddProduct;