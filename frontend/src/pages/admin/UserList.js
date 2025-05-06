import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { SpinnerImg } from "../../components/loader/Loader";
import { getAllUsers, deleteUser } from "../../services/adminService";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "../../redux/features/auth/authSlice";
import ReactPaginate from "react-paginate";
import Search from "../../components/search/Search";
import "./UserList.scss";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);

  // Pagination states
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle pagination
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(filteredUsers.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredUsers.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, filteredUsers]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filteredUsers.length;
    setItemOffset(newOffset);
  };

  // Handle search
  useEffect(() => {
    const result = users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(result);
    setItemOffset(0); // Reset to first page on search
  }, [users, search]);

  const confirmDelete = (id) => {
    confirmAlert({
      title: "Delete User",
      message: "Are you sure you want to delete this user?",
      buttons: [
        {
          label: "Delete",
          onClick: () => deleteUserHandler(id),
        },
        {
          label: "Cancel",
        },
      ],
    });
  };

  const deleteUserHandler = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddUser = () => {
    navigate("/admin/user/add");
  };

  const shortenText = (text, n) => {
    if (!text) return "";
    if (text.length > n) {
      const shortenedText = text.substring(0, n).concat("...");
      return shortenedText;
    }
    return text;
  };

  return (
    <div className="user-list">
      <div className="table">
        <div className="--flex-between --flex-dir-column">
          <h3>User Management</h3>
          <div className="--flex-between">
            <div className="search">
              <Search
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users"
              />
            </div>
            <button
              className="add-button"
              onClick={handleAddUser}
            >
              <FaUserPlus /> Add User
            </button>
          </div>
        </div>

        {isLoading && <SpinnerImg />}

        <div className="table">
          {!isLoading && users.length === 0 ? (
            <p className="--text-center --py2">
              No users found. Please add a user.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Categories</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((user, index) => {
                  const {
                    _id,
                    name,
                    email,
                    role,
                    categories,
                    createdAt,
                    photo,
                  } = user;
                  return (
                    <tr key={_id}>
                      <td>{itemOffset + index + 1}</td>
                      <td>
                        <div className="user-profile">
                          <img
                            src={photo}
                            alt={name}
                            className="avatar"
                          />
                          <span className="user-name">
                            {shortenText(name, 15)}
                          </span>
                        </div>
                      </td>
                      <td>{shortenText(email, 20)}</td>
                      <td>
                        <span
                          className={`badge ${
                            role === "admin" ? "admin" : "employee"
                          }`}
                        >
                          {role}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            maxWidth: "200px",
                            display: "flex",
                            flexWrap: "wrap",
                          }}
                        >
                          {categories && categories.length > 0 ? (
                            categories.map((category, idx) => (
                              <span
                                key={idx}
                                className="badge category"
                              >
                                {shortenText(category, 10)}
                              </span>
                            ))
                          ) : (
                            <span className="--text-sm --color-grey">
                              No categories
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{new Date(createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="edit"
                            onClick={() => navigate(`/admin/user/edit/${_id}`)}
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
        </div>
        <ReactPaginate
          breakLabel="..."
          nextLabel="Next"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="Prev"
          renderOnZeroPageCount={null}
          containerClassName="pagination"
          pageLinkClassName="page-num"
          previousLinkClassName="page-num"
          nextLinkClassName="page-num"
          activeLinkClassName="activePage"
        />
      </div>
    </div>
  );
};

export default UserList;
