import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectName,
  SET_LOGIN,
  selectIsLoggedIn,
} from "../../redux/features/auth/authSlice";
import { logoutUser } from "../../services/authService";
import { FiBell, FiLogOut } from "react-icons/fi";
import Notification from "../notification/Notification";
import "./Header.scss";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const name = useSelector(selectName);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const logout = async () => {
    await logoutUser();
    await dispatch(SET_LOGIN(false));
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-top">
          <h3>
            <span className="welcome-text">Welcome,</span>
            <span className="user-name">{name}</span>
          </h3>
          <div className="header-actions">
            {isLoggedIn && (
              <div className="notification-btn-wrapper">
                <Notification />
              </div>
            )}
            <button
              onClick={logout}
              className="logout-btn"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
