import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Registration.css'; 
import arrowImg from "../../src/assets/Arrow.png";
import staticLogoImage from '../assets/PostoryLogo_W.png'; 

import { db } from "../firebaseConfig"; 
import { doc, setDoc } from "firebase/firestore";

const Registration = () => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    city: "",
    mobile: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegistrationSubmit = async () => {
    const { name, email, mobile, surname, city } = formData;

    if (!name || !email || !mobile || !termsAccepted) {
      alert("Please fill all required details and accept terms.");
      return;
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      alert("Please enter a valid Name (Only alphabets are allowed).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid Email Address.");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      alert("Please enter a valid 10-digit Mobile Number.");
      return;
    }

    try {

      await setDoc(doc(db, "users", mobile), {
        name,
        surname,
        email,
        city,
        mobile,
        createdAt: new Date().toISOString()
      });


      localStorage.setItem("userData", JSON.stringify(formData));
      localStorage.setItem("isLoggedIn", "true");

      alert("Registration successful!");
      navigate("/home"); 

    } catch (error) {
      console.error("Firestore Error:", error);
      alert("Error saving data: " + error.message);
    }
  };
useEffect(() => {
  const googleData = JSON.parse(localStorage.getItem("tempGoogleData"));
  if (googleData) {
    setFormData(prev => ({
      ...prev,
      name: googleData.name,
      email: googleData.email
    }));
  }
}, []);
  return (
    <div className="registration-container">
      <div className="center-logo1">
        <div className="logo-wrapper">
          <div className="logo-ring"></div>
          <div className="logo-right">
            <span className="signup-text">Sign Up</span>
            <img src={staticLogoImage} alt="Post Story" className="logo-text" />
            <p className="tagline-below-logo">Simple Sharing<br />Starts Here!</p>
          </div>
        </div>
      </div>

      <div className="input-group">
        <input type="text" name="name" placeholder="Name" className="rounded-input" onChange={handleChange} />
      </div>
      <div className="input-group">
        <input type="text" name="surname" placeholder="Surname" className="rounded-input" onChange={handleChange} />
      </div>
      <div className="input-group">
        <input type="email" name="email" placeholder="Email ID" className="rounded-input" onChange={handleChange} />
      </div>
      <div className="input-group">
        <input type="text" name="city" placeholder="Town/City" className="rounded-input" onChange={handleChange} />
      </div>
      <div className="input-group mobile-input-below-button">
        <input type="text" name="mobile" placeholder="Mobile Number" className="rounded-input" maxLength="10" onChange={handleChange} />
      </div>

      <div className="terms-checkbox">
        <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
        <label htmlFor="terms">Agree Terms & Conditions</label>
      </div>

      <button className="continue-button1" onClick={handleRegistrationSubmit}>
        Continue <img src={arrowImg} alt="arrow" className="arrow-icon" />
      </button>

      <div className="bottom-arc-container">
        <div className="bottom-arc-gradient"></div>
      </div>
      <div className="center-animated-ring-wrapper2">
        <div className="center-animated-ring2"></div>
      </div>
    </div>
  );
};

export default Registration;