import React, { useState } from "react";
import styles from "./auth.module.scss";
import { BiLogIn } from "react-icons/bi";
import Card from "../../components/card/Card";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loginUser, validateEmail } from "../../services/authService";
import {
  SET_LOGIN,
  SET_NAME,
  SET_USER,
} from "../../redux/features/auth/authSlice";
import Loader from "../../components/loader/Loader";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setformData] = useState(initialState);
  const { email, password } = formData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setformData({ ...formData, [name]: value });
  };

  const login = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("All fields are required");
    }

    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email");
    }

    // Check if backend URL is configured
    if (!process.env.REACT_APP_BACKEND_URL) {
      console.error("Backend URL not configured");
      return toast.error("Server configuration error. Please contact support.");
    }

    const userData = {
      email,
      password,
    };
    setIsLoading(true);
    try {
      console.log("Starting login process...");
      const data = await loginUser(userData);
      console.log("Login response received:", data);

      if (data) {
        dispatch(SET_LOGIN(true));
        dispatch(SET_NAME(data.name));
        dispatch(SET_USER(data));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Don't show the error message here as it's already shown in the service
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={` ${styles.auth}`}>
      {isLoading && <Loader />}
      <Card>
        <div className={styles.form}>
          <div className="--flex-center">
            <BiLogIn
              size={40}
              color="#1e2749"
            />
          </div>
          <h2>Welcome Back</h2>

          <form onSubmit={login}>
            <div className="--form-control">
              <input
                type="email"
                placeholder="Enter your email"
                required
                name="email"
                value={email}
                onChange={handleInputChange}
              />
            </div>
            <div className="--form-control">
              <input
                type="password"
                placeholder="Enter your password"
                required
                name="password"
                value={password}
                onChange={handleInputChange}
              />
            </div>
            <button
              type="submit"
              className="--btn --btn-primary --btn-block"
            >
              Sign In
            </button>
          </form>

          <div className="--flex-center">
            <Link to="/forgot">Forgot Password?</Link>
          </div>

          <div className={styles.register}>
            <Link to="/">Back to Home</Link>
            <p>&nbsp;•&nbsp;</p>
            <Link to="/register">Create Account</Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
