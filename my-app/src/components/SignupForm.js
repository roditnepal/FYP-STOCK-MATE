import React from 'react';
import './SignupForm.css';

const SignupForm = () => {
  return (
    <div className="form-container">
      <form className="account-form">
        <h1>Create New Account</h1>
        <p>Users are required to fill in all information</p>
        <div className="form-group">
          <label htmlFor="company-name">Company Name:</label>
          <input type="text" id="company-name" placeholder="Enter your company name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" placeholder="Enter your email" required />
        </div>
        <div className="form-group">
          <label htmlFor="contact-number">Contact Number:</label>
          <input type="text" id="contact-number" placeholder="Enter your contact number" required />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" placeholder="Enter your username" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" placeholder="Enter password" required />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input type="password" id="confirm-password" placeholder="Enter confirm password" required />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input type="text" id="address" placeholder="Enter address" required />
        </div>
        <div className="form-group">
          <label htmlFor="pan-number">PAN Number:</label>
          <input type="text" id="pan-number" placeholder="Enter PAN number" required />
        </div>
        <div className="form-group">
          <label htmlFor="register-field">Register Field:</label>
          <select id="register-field">
            <option value="nagarpalika">Nagarpalika</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="register-number">Register Number:</label>
          <input type="text" id="register-number" placeholder="Enter register number" required />
        </div>
        <div className="form-group">
          <label htmlFor="register-date">Registered Date:</label>
          <input type="date" id="register-date" required />
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" id="terms" required />
          <label htmlFor="terms">I accept the terms and conditions applied.</label>
        </div>
        <button type="submit" className="submit-button">Sign Up</button>
        <p className="login-link">Already have an account? <a href="#">Login</a></p>
      </form>
    </div>
  );
};

export default SignupForm;
