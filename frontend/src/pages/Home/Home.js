import React from "react";
import { RiProductHuntLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import "./Home.scss";
import heroImg from "../../assets/inv-img.png";
import { ShowOnLogin, ShowOnLogout } from "../../components/protect/HiddenLink";

const Home = () => {
  return (
    <div className="home">
      <nav className="container --flex-between">
        <div className="logo">
          <RiProductHuntLine
            size={40}
            color="#fafaff"
          />
        </div>

        <ul className="home-links">
          <ShowOnLogout>
            <li>
              <Link to="/register">Create Account</Link>
            </li>
          </ShowOnLogout>
          <ShowOnLogout>
            <li>
              <button className="--btn">
                <Link to="/login">Sign In</Link>
              </button>
            </li>
          </ShowOnLogout>
          <ShowOnLogin>
            <li>
              <button className="--btn">
                <Link to="/dashboard">Dashboard</Link>
              </button>
            </li>
          </ShowOnLogin>
        </ul>
      </nav>

      <section className="container hero">
        <div className="hero-text">
          <h2>Smart Inventory Management Solution</h2>
          <p>
            Take control of your inventory with our powerful management system.
            Track, manage, and optimize your stock in real-time with advanced
            analytics and intuitive tools designed for modern businesses.
          </p>
          <div className="--flex-start">
            <NumberText
              num="14K+"
              text="Active Users"
            />
            <NumberText
              num="23K+"
              text="Products Tracked"
            />
            <NumberText
              num="500+"
              text="Business Partners"
            />
          </div>
        </div>

        <div className="hero-image">
          <img
            src={heroImg}
            alt="Inventory Management"
          />
        </div>
      </section>
    </div>
  );
};

const NumberText = ({ num, text }) => {
  return (
    <div className="--mr">
      <h3>{num}</h3>
      <p>{text}</p>
    </div>
  );
};

export default Home;
