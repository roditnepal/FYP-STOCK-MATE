import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Card from "../../components/card/Card";
import { SpinnerImg } from "../../components/loader/Loader";
import useRedirectLoggedOutUser from "../../customHook/useRedirectLoggedOutUser";
import { SET_NAME, SET_USER } from "../../redux/features/auth/authSlice";
import { getUser } from "../../services/authService";
import "./Profile.scss";
import { FiUser, FiMail, FiPhone, FiInfo, FiEdit2 } from "react-icons/fi";

const Profile = () => {
  useRedirectLoggedOutUser("/login");
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    async function getUserData() {
      const data = await getUser();
      setProfile(data);
      setIsLoading(false);
      await dispatch(SET_USER(data));
      await dispatch(SET_NAME(data.name));
    }
    getUserData();
  }, [dispatch]);

  return (
    <div className="profile">
      <div className="page-header">
        <h3>
          <FiUser /> Profile
        </h3>
      </div>

      {isLoading && <SpinnerImg />}
      {!isLoading && profile === null ? (
        <p>Something went wrong, please reload the page...</p>
      ) : (
        <Card cardClass="card">
          <div className="profile-photo">
            <img
              src={profile?.photo}
              alt="profile"
            />
          </div>
          <div className="profile-data">
            <div className="info-group">
              <label>
                <FiUser /> Name
              </label>
              <p>{profile?.name}</p>
            </div>
            <div className="info-group">
              <label>
                <FiMail /> Email
              </label>
              <p>{profile?.email}</p>
            </div>
            <div className="info-group">
              <label>
                <FiPhone /> Phone
              </label>
              <p>{profile?.phone}</p>
            </div>
            <div className="info-group">
              <label>
                <FiInfo /> Bio
              </label>
              <p>{profile?.bio}</p>
            </div>
            <div className="action-buttons">
              <Link
                to="/edit-profile"
                className="--btn --btn-primary"
              >
                <FiEdit2 /> Edit Profile
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Profile;
