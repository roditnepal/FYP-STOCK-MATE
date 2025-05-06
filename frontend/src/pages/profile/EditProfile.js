import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card/Card";
import Loader from "../../components/loader/Loader";
import { selectUser } from "../../redux/features/auth/authSlice";
import "./Profile.scss";
import { toast } from "react-toastify";
import { updateUser } from "../../services/authService";
import ChangePassword from "../../components/changePassword/ChangePassword";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiInfo,
  FiImage,
  FiSave,
} from "react-icons/fi";

const EditProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(selectUser);
  const { email } = user;

  useEffect(() => {
    if (!email) {
      navigate("/profile");
    }
  }, [email, navigate]);

  const initialState = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    photo: user?.photo || "https://i.ibb.co/4pDNDk1/avatar.png",
  };
  const [profile, setProfile] = useState(initialState);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.photo || null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedFormats = ["image/png", "image/jpg", "image/jpeg"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedFormats.includes(file.type)) {
        toast.error("Unsupported file format. Please use JPG, JPEG, or PNG.");
        e.target.value = null;
        return;
      }
      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit.");
        e.target.value = null;
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      formData.append("bio", profile.bio);
      if (profileImage) {
        formData.append("photo", profileImage);
      }

      // Log FormData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const data = await updateUser(formData);
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile">
      <div className="page-header">
        <h3>
          <FiUser /> Edit Profile
        </h3>
      </div>

      {isLoading && <Loader />}

      <Card cardClass="card">
        <div className="profile-photo">
          <img
            src={imagePreview || profile.photo}
            alt="profile"
          />
        </div>
        <div className="profile-data">
          <form onSubmit={saveProfile}>
            <div className="info-group">
              <label>
                <FiUser /> Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="info-group">
              <label>
                <FiMail /> Email
              </label>
              <input
                type="text"
                name="email"
                value={profile.email}
                disabled
              />
              <small>Email cannot be changed.</small>
            </div>
            <div className="info-group">
              <label>
                <FiPhone /> Phone
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="info-group">
              <label>
                <FiInfo /> Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows="4"
              ></textarea>
            </div>
            <div className="info-group">
              <label>
                <FiImage /> Profile Photo
              </label>
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
              />
            </div>
            <div className="action-buttons">
              <button
                type="submit"
                className="--btn --btn-primary"
              >
                <FiSave /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </Card>

      <ChangePassword />
    </div>
  );
};

export default EditProfile;