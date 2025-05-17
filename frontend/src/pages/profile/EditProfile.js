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
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    bio: user?.bio,
    photo: user?.photo,
  };
  const [profile, setProfile] = useState(initialState);
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState(user?.photo);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error("Please select a valid image file (jpg, jpeg, or png)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
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
      let imageURL = profile.photo; // Default to existing photo

      // If a new image is selected, upload it to the backend first
      if (profileImage) {
        console.log("Uploading image to backend...");
        const formData = new FormData();
        formData.append("image", profileImage);

        // Get backend URL from environment variables
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        if (!backendUrl) {
          console.error("Backend URL environment variable not set!");
          toast.error("Backend URL is not configured.");
          setIsLoading(false);
          return;
        }

        // Call backend endpoint to upload image
        const response = await fetch(`${backendUrl}/api/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend Image Upload Error:", errorData);
          throw new Error(
            errorData.message || "Failed to upload image to backend."
          );
        }

        const responseData = await response.json();
        imageURL = responseData.imageURL; // Backend should return the Cloudinary URL
        console.log("Backend upload successful, received URL:", imageURL);
      }

      // Save Profile data with the potentially new image URL
      const formData = {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        photo: imageURL,
      };

      console.log("Updating user profile with data:", formData);
      const data = await updateUser(formData);
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error) {
      console.error("Save Profile Error:", error);
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
            src={imagePreview || "https://via.placeholder.com/150"}
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
                value={profile?.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="info-group">
              <label>
                <FiMail /> Email
              </label>
              <input
                type="text"
                name="email"
                value={profile?.email}
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
                value={profile?.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="info-group">
              <label>
                <FiInfo /> Bio
              </label>
              <textarea
                name="bio"
                value={profile?.bio}
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
                name="image"
                onChange={handleImageChange}
                accept="image/jpeg,image/jpg,image/png"
              />
              <small>Supported formats: jpg, jpeg, png (max 5MB)</small>
            </div>
            <div className="action-buttons">
              <button
                type="submit"
                className="--btn --btn-primary"
                disabled={isLoading}
              >
                <FiSave /> {isLoading ? "Saving..." : "Save Changes"}
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
