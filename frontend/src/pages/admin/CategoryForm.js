import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiTag, FiFileText } from "react-icons/fi";
import { toast } from "react-toastify";
import Loader from "../../components/loader/Loader";
import categoryService from "../../services/categoryService";
import "./CategoryForm.scss";

const CategoryForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Get category if editing
  const getCategory = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategory(id);
      setFormData({
        name: data.name,
        description: data.description,
      });
      setIsLoading(false);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getCategory();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await categoryService.updateCategory(id, formData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.createCategory(formData);
        toast.success("Category created successfully");
      }
      navigate("/admin/categories");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
    }
    setIsLoading(false);
  };

  return (
    <div className="category-form">
      <div className="category-form-header">
        <h2>{id ? "Edit Category" : "Add Category"}</h2>
      </div>

      <div className="category-form-content">
        {isLoading && <Loader />}

        <form onSubmit={saveCategory}>
          <div className="form-group">
            <label>
              <FiTag size={18} /> Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiFileText size={18} /> Description
            </label>
            <textarea
              name="description"
              placeholder="Enter category description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel"
              onClick={() => navigate("/admin/categories")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save"
            >
              {id ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
