import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createUser, getUser, updateUser } from "../../services/adminService";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "../../redux/features/auth/authSlice";
import { getProducts } from "../../services/productService";
import {
  FiUser,
  FiMail,
  FiLock,
  FiUserCheck,
  FiTag,
  FiPhone,
  FiFileText,
  FiUpload,
} from "react-icons/fi";
import "./UserForm.scss";

const initialState = {
  name: "",
  email: "",
  password: "",
  role: "employee",
  categories: [],
  phone: "",
  bio: "",
  photo: "https://i.ibb.co/4pDNDk1/avatar.png",
};

const UserForm = () => {
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userImage, setUserImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const isAdmin = useSelector(selectIsAdmin);

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  // Fetch available categories from products
  const fetchCategories = async () => {
    try {
      const products = await getProducts();
      const uniqueCategories = [
        ...new Set(products.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // If editing, fetch user data
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setIsLoading(true);

      getUser(id)
        .then((user) => {
          setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            phone: user.phone || "",
            bio: user.bio || "",
            photo: user.photo,
          });

          setSelectedCategories(user.categories || []);
          setImagePreview(user.photo);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setUserImage(e.target.files[0]);
    setImagePreview(URL.createObjectURL(e.target.files[0]));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      setSelectedCategories([...selectedCategories, value]);
    } else {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email) {
      return toast.error("Name and email are required");
    }

    // If adding new user, password is required
    if (!isEditing && !formData.password) {
      return toast.error("Password is required for new users");
    }

    try {
      // Create FormData only when there's a new image
      if (userImage) {
        const userData = new FormData();
        userData.append("name", formData.name);
        userData.append("email", formData.email);
        if (formData.password) {
          userData.append("password", formData.password);
        }
        userData.append("role", formData.role);
        userData.append("phone", formData.phone);
        userData.append("bio", formData.bio);

        // Append each category
        selectedCategories.forEach((category) => {
          userData.append("categories", category);
        });

        userData.append("image", userImage);

        if (isEditing) {
          await updateUser(id, userData);
        } else {
          await createUser(userData);
        }
      } else {
        // Use regular JSON for text-only updates
        const userData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          bio: formData.bio,
          categories: selectedCategories,
        };

        // Add password only if provided
        if (formData.password) {
          userData.password = formData.password;
        }

        if (isEditing) {
          await updateUser(id, userData);
        } else {
          await createUser(userData);
        }
      }

      // Success toast is already shown in the service, don't show it here
      navigate("/admin/users");
    } catch (error) {
      console.log(error);
      // Error is already shown in the service, don't show it here
    }
  };

  return (
    <div className="add-user">
      <div className="form-title">
        <FiUser size={28} />
        <h2>{isEditing ? "Edit User" : "Add New User"}</h2>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-left">
            <div className="image-upload">
              <label>
                <FiUpload size={18} />
                <div>User Image</div>
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
                    alt="user"
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
                <FiUser size={18} /> Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail size={18} /> Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiLock size={18} />{" "}
                {isEditing
                  ? "Password (leave blank to keep current)"
                  : "Password"}
              </label>
              <input
                type="password"
                placeholder={
                  isEditing ? "Enter new password" : "Enter password"
                }
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>
                <FiUserCheck size={18} /> Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <FiPhone size={18} /> Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter phone number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="categories-group">
              <label>
                <FiTag size={18} /> Category Access
              </label>
              <div className="categories-container">
                {categories.length === 0 ? (
                  <p>No categories available</p>
                ) : (
                  categories.map((category, index) => (
                    <div
                      className="category-item"
                      key={index}
                    >
                      <input
                        type="checkbox"
                        id={`category-${index}`}
                        value={category}
                        checked={selectedCategories.includes(category)}
                        onChange={handleCategoryChange}
                      />
                      <label htmlFor={`category-${index}`}>{category}</label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bio-group">
              <label>
                <FiFileText size={18} /> Bio
              </label>
              <textarea
                name="bio"
                placeholder="Enter user bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
              ></textarea>
            </div>

            <div className="submit-btn">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/admin/users")}
              >
                Cancel
              </button>
              <button type="submit">
                {isEditing ? "Update User" : "Add User"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserForm;
