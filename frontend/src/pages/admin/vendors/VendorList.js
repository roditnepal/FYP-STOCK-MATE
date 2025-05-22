import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus, FiPackage } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import vendorService from "../../../services/vendorService";
import Loader from "../../../components/loader/Loader";
import "./VendorList.scss";
import { selectIsAdmin } from "../../../redux/features/auth/authSlice";

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      try {
        const data = await vendorService.getVendors();
        setVendors(data);
      } catch (error) {
        toast.error("Failed to load vendors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const confirmDelete = (id, name) => {
    confirmAlert({
      title: "Delete Vendor",
      message: `Are you sure you want to delete vendor: ${name}?`,
      buttons: [
        {
          label: "Delete",
          onClick: () => deleteVendor(id),
        },
        {
          label: "Cancel",
        },
      ],
    });
  };

  const deleteVendor = async (id) => {
    try {
      await vendorService.deleteVendor(id);
      toast.success("Vendor deleted successfully");
      // Update vendors list
      setVendors(vendors.filter((vendor) => vendor._id !== id));
    } catch (error) {
      toast.error("Error deleting vendor");
    }
  };

  const handleAddVendor = () => {
    navigate("/admin/vendor/add");
  };

  return (
    <div className="vendor-list-container">
      <div className="vendor-list-header">
        <h2>Vendors</h2>
        <button className="--btn --btn-primary" onClick={handleAddVendor}>
          <FiPlus /> Add New Vendor
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : vendors.length === 0 ? (
        <div className="no-vendors">
          <p>No vendors found. Add your first vendor!</p>
        </div>
      ) : (
        <div className="vendors-grid">
          {vendors.map((vendor) => (
            <div className="vendor-card" key={vendor._id}>
              <div className="vendor-info">
                <h3>{vendor.name}</h3>
                <div className="vendor-details">
                  <p>
                    <strong>Contact:</strong> {vendor.contact || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {vendor.email || "N/A"}
                  </p>
                  {vendor.address && (
                    <p>
                      <strong>Address:</strong> {vendor.address}
                    </p>
                  )}
                </div>
              </div>
              <div className="vendor-actions">
                <Link
                  to={`/vendor/products/${vendor._id}`}
                  className="view-products-btn"
                >
                  <FiPackage /> View Products
                </Link>
                <Link
                  to={`/admin/vendor/edit/${vendor._id}`}
                  className="edit-btn"
                >
                  <FiEdit />
                </Link>
                <button
                  className="delete-btn"
                  onClick={() => confirmDelete(vendor._id, vendor.name)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorList;