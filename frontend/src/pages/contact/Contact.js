import React, { useState } from "react";
import Card from "../../components/card/Card";
import "./Contact.scss";
import { FaPhoneAlt, FaEnvelope, FaTwitter } from "react-icons/fa";
import { GoLocation } from "react-icons/go";
import { FiMessageSquare, FiSend, FiHelpCircle, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import { BACKEND_URL } from "../../services/authService";

const Contact = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const data = {
    subject,
    message,
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/api/contactus`, data);
      setSubject("");
      setMessage("");
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="contact">
      <div className="page-header">
        <h3>
          <FiHelpCircle /> Contact Support
        </h3>
      </div>

      <div className="section">
        <form onSubmit={sendEmail}>
          <Card cardClass="card">
            <div className="form-group">
              <label>
                <FiMessageSquare /> Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="How can we help you?"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                <FiMail /> Message
              </label>
              <textarea
                name="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <button type="submit">
              <FiSend />
              Send Message
            </button>
          </Card>
        </form>

        <div className="contact-info">
          <h4>
            <FiHelpCircle /> Contact Information
          </h4>

          <div className="info-item">
            <FaPhoneAlt />
            <div className="info-content">
              <h5>Phone</h5>
              <p>+1 (234) 567-8900</p>
            </div>
          </div>

          <div className="info-item">
            <FaEnvelope />
            <div className="info-content">
              <h5>Email</h5>
              <a href="mailto:support@stockmate.com">support@stockmate.com</a>
            </div>
          </div>

          <div className="info-item">
            <GoLocation />
            <div className="info-content">
              <h5>Address</h5>
              <p>
                123 Business Street, Suite 100
                <br />
                New York, NY 10001
              </p>
            </div>
          </div>

          <div className="info-item">
            <FaTwitter />
            <div className="info-content">
              <h5>Social Media</h5>
              <a
                href="https://twitter.com/stockmate"
                target="_blank"
                rel="noopener noreferrer"
              >
                @stockmate
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
