import React, { useState, useEffect } from "react";
import "./Sidebar.scss";
import { HiMenuAlt3 } from "react-icons/hi";
import { RiProductHuntLine } from "react-icons/ri";
import menuItems from "../../data/sidebar";
import SidebarItem from "./SidebarItem";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAdmin,
  selectUser,
  selectIsLoggedIn,
} from "../../redux/features/auth/authSlice";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [userMenuItems, setUserMenuItems] = useState([]);
  const toggle = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // Filter menu items based on user role when user data is loaded
  useEffect(() => {
    // Only filter the menu when we're sure about the login state and user data
    if (isLoggedIn !== null) {
      const filtered = menuItems.filter((item) => {
        // If item is admin-only, only show it to admin users
        if (item.adminOnly && !isAdmin) {
          return false;
        }
        return true;
      });

      setUserMenuItems(filtered);
    }
  }, [isLoggedIn, isAdmin, user]);

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="layout">
      <div
        className="sidebar"
        style={{ width: isOpen ? "230px" : "60px" }}
      >
        <div className="top_section">
          {/* <div className="logo" style={{ display: isOpen ? "block" : "none" }}>
            <RiProductHuntLine
              size={35}
              style={{ cursor: "pointer" }}
              onClick={goHome}
            />
          </div> */}

          <div
            className="menu-title"
            style={{ width: isOpen ? "auto" : "0", opacity: isOpen ? 1 : 0 }}
          >
            <span>Stock Mate</span>
          </div>
          <div className="bars">
            <HiMenuAlt3
              size={24}
              onClick={toggle}
            />
          </div>
        </div>
        {userMenuItems.map((item, index) => {
          return (
            <SidebarItem
              key={index}
              item={item}
              isOpen={isOpen}
            />
          );
        })}
      </div>

      <main
        style={{
          paddingLeft: isOpen ? "230px" : "60px",
          transition: "all .5s",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
