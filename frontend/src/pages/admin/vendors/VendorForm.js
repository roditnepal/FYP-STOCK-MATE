import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUser, FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { toast } from "react-toastify";
import Loader from "../../../components/loader/Loader";
import vendorService from "../../../services/vendorService";
import "./VendorForm.scss";

const VendorForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Get vendor if editing
  const getVendor = async () => {
    setIsLoading(true);
    try {
      const data = await vendorService.getVendor(id);
      setFormData({
        name: data.name,
        contact: data.contact,
        email: data.email || "",
        address: data.address || "",
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
    if (isEditing) {
      getVendor();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const saveVendor = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        // Update vendor
        await vendorService.updateVendor(id, formData);
        toast.success("Vendor updated successfully");
      } else {
        // Create vendor
        await vendorService.createVendor(formData);
        toast.success("Vendor added successfully");
      }
      navigate("/admin/vendors");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vendor-form">
      {isLoading && <Loader />}
      <h1>{isEditing ? "Edit Vendor" : "Add New Vendor"}</h1>

      <div className="form-container">
        <form onSubmit={saveVendor}>
          <div className="form-group">
            <label>
              <FiUser size={18} /> Name
            </label>
            <input
              type="text"
              placeholder="Enter vendor name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiPhone size={18} /> Contact Number
            </label>
            <input
              type="text"
              placeholder="Enter contact number"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiMail size={18} /> Email
            </label>
            <input
              type="email"
              placeholder="Enter email address (optional)"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>
              <FiMapPin size={18} /> Address
            </label>
            <textarea
              placeholder="Enter address (optional)"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="button-group">
            <button type="submit" className="--btn --btn-primary">
              {isEditing ? "Update Vendor" : "Save Vendor"}
            </button>
            <button
              type="button"
              className="--btn --btn-secondary"
              onClick={() => navigate("/admin/vendors")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;
