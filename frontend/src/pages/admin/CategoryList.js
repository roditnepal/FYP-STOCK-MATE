import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/loader/Loader";
import categoryService from "../../services/categoryService";
import "./CategoryList.scss";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();

  // Get categories
  const getCategories = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching categories...");
      const data = await categoryService.getCategories();
      console.log("Categories fetched:", data);
      setCategories(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
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
    getCategories();
  }, []);

  // Delete category
  const confirmDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategory(id);
    }
  };

  const deleteCategory = async (id) => {
    setIsLoading(true);
    try {
      await categoryService.deleteCategory(id);
      toast.success("Category deleted successfully");
      getCategories();
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

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="category-list">
      <div className="category-list-header">
        <h2>Categories</h2>
        <button
          className="add-button"
          onClick={() => navigate("/admin/category/add")}
        >
          <FiPlus size={20} /> Add Category
        </button>
      </div>

      <div className="category-list-content">
        {isLoading && <Loader />}

        <div className="search-container">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!isLoading && categories.length === 0 ? (
          <p>No categories found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((category) => {
                const { _id, name, description, createdBy, createdAt } =
                  category;
                return (
                  <tr key={_id}>
                    <td>{name}</td>
                    <td>{description}</td>
                    <td>{createdBy.name}</td>
                    <td>{new Date(createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="edit"
                          onClick={() =>
                            navigate(`/admin/category/edit/${_id}`)
                          }
                        >
                          <FiEdit2 size={20} />
                        </button>
                        <button
                          className="delete"
                          onClick={() => confirmDelete(_id)}
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={currentPage === pageNumber ? "active" : ""}
                >
                  {pageNumber}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
