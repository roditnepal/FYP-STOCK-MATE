import React, { useState } from "react";
import { toast } from "react-toastify";
import { changePassword } from "../../services/authService";
import Card from "../card/Card";
import Loader from "../loader/Loader";
import { FiLock, FiKey, FiSave, FiShield } from "react-icons/fi";

const initialState = {
  oldPassword: "",
  password: "",
  password2: "",
};

const ChangePassword = () => {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const { oldPassword, password, password2 } = formData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const changePass = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      return toast.error("New passwords do not match");
    }

    setIsLoading(true);

    try {
      const data = await changePassword({ oldPassword, password });
      setIsLoading(false);
      toast.success(data);
      setFormData({ ...initialState });
    } catch (error) {
      setIsLoading(false);
      toast.error(error);
    }
  };

  return (
    <div className="change-password">
      {isLoading && <Loader />}

      <Card cardClass="card">
        <div className="section-header">
          <h3>
            <FiShield /> Change Password
          </h3>
          <p>
            Update your password to keep your account secure. We recommend using
            a strong, unique password that you don't use elsewhere.
          </p>
        </div>

        <form onSubmit={changePass}>
          <div className="info-group">
            <label>
              <FiKey /> Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              required
              name="oldPassword"
              value={oldPassword}
              onChange={handleInputChange}
            />
          </div>
          <div className="info-group">
            <label>
              <FiLock /> New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              required
              name="password"
              value={password}
              onChange={handleInputChange}
            />
            <small>
              Password must be at least 8 characters long with a mix of letters,
              numbers, and symbols.
            </small>
          </div>
          <div className="info-group">
            <label>
              <FiLock /> Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              required
              name="password2"
              value={password2}
              onChange={handleInputChange}
            />
          </div>

          <div className="action-buttons">
            <button
              type="submit"
              className="--btn --btn-primary"
            >
              <FiSave /> Update Password
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;
