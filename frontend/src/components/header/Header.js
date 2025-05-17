import React from "react";
import { useSelector } from "react-redux";
import {
  selectName,
  selectIsLoggedIn,
} from "../../redux/features/auth/authSlice";
import { FiBell } from "react-icons/fi";
import Notification from "../notification/Notification";
import UserDropdown from "../userDropdown/UserDropdown";
import "./Header.scss";

const Header = () => {
  const name = useSelector(selectName);
  const isLoggedIn = useSelector(selectIsLoggedIn);

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
              <>
                <div className="notification-btn-wrapper">
                  <Notification />
                </div>
                <UserDropdown />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
