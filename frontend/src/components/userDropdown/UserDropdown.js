import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, SET_LOGIN } from "../../redux/features/auth/authSlice";
import { logoutUser } from "../../services/authService";
import { FiUser, FiEdit2, FiLogOut } from "react-icons/fi";
import "./UserDropdown.scss";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    await dispatch(SET_LOGIN(false));
    navigate("/login");
  };

  return (
    <div
      className="user-dropdown"
      ref={dropdownRef}
    >
      <button
        className="user-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={user?.photo || "https://via.placeholder.com/40"}
          alt="user"
          className="user-avatar"
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            <img
              src={user?.photo || "https://via.placeholder.com/40"}
              alt="user"
              className="user-avatar-large"
            />
            <div className="user-details">
              <h4>{user?.name}</h4>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <button
            className="dropdown-item"
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
          >
            <FiUser /> Profile
          </button>
          <button
            className="dropdown-item"
            onClick={() => {
              navigate("/edit-profile");
              setIsOpen(false);
            }}
          >
            <FiEdit2 /> Edit Profile
          </button>
          <div className="dropdown-divider"></div>
          <button
            className="dropdown-item logout"
            onClick={handleLogout}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
