import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Registration.css'; 
import arrowImg from "../../src/assets/Arrow.png";
import staticLogoImage from '../assets/Logo2.png'; 
import Swal from 'sweetalert2';
import { db } from "../firebaseConfig"; 
import { doc, setDoc, getDoc } from "firebase/firestore";
import axios from 'axios';

const Registration = () => {
  const navigate = useNavigate();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "", 
    city: "",
    mobile: ""
  });

  const REGION_URL = "https://us-central1-allezpoststory.cloudfunctions.net";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Extracts the clean 10-digit number for Firestore database ID and internal tracking
  const getRaw10Digit = (num) => {
    return num.replace(/\D/g, '').slice(-10);
  };

  // Formats the number with country code for Twilio Cloud Functions (+91)
  const getTwilioFormattedMobile = (num) => {
    const digits = getRaw10Digit(num);
    return `+91${digits}`;
  };

  const handleSendOtp = async () => {
    const { mobile, name } = formData;

    if (!name) {
      alert("Please enter your Name first.");
      return;
    }

    try {
      setLoading(true);
      const raw10 = getRaw10Digit(mobile);

      if (raw10.length < 10) {
        alert("Valid 10-digit number is required.");
        setLoading(false);
        return;
      }

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", raw10));

      if (userDoc.exists()) {
        alert("Number already registered");
        setLoading(false);
        navigate("/login");
        return;
      }

      const twilioPhone = getTwilioFormattedMobile(mobile);
      await axios.post(`${REGION_URL}/sendTwilioOTP`, { phone: twilioPhone });
      
      setIsOtpSent(true);
      setLoading(false);

      Swal.fire({
        title: 'OTP Sent Successfully! ✅',
        background: 'rgba(255, 255, 255, 0.15)', 
        color: '#ffffff',
        backdrop: 'rgba(0, 0, 0, 0.4)', 
        showConfirmButton: false,
        timer: 2000,
        customClass: { popup: 'transparent-alert' }
      });
    } catch (error) {
      setLoading(false);
      console.error("OTP Send Error:", error);
      alert("Error: " + (error.response?.data?.error || error.message));
    }
  };

  const handleRegistrationSubmit = async () => {
    const { name, email, mobile, surname, city } = formData;

    if (!name || !mobile || !termsAccepted) {
      alert("Please fill all required details and accept terms.");
      return;
    }

    const raw10 = getRaw10Digit(mobile);
    const twilioPhone = getTwilioFormattedMobile(mobile);
    const cleanOtp = otp.replace(/\s/g, '').trim();

    if (!isOtpSent) {
      alert("Please click 'Send OTP'.");
      return;
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      alert("Please enter 6 digit OTP.");
      return;
    }

    try {
      setLoading(true);

      // Verify OTP via Cloud Function
      await axios.post(`${REGION_URL}/verifyTwilioOTP`, { phone: twilioPhone, otp: cleanOtp });

      // Save user record to Firestore using the 10-digit key
      await setDoc(doc(db, "users", raw10), {
        name,
        surname: surname || "",
        email: email || "", 
        city: city || "",
        mobile: raw10,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("userData", JSON.stringify({ ...formData, mobile: raw10 }));
      localStorage.setItem("userPhone", raw10);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.removeItem("tempGoogleData");

      Swal.fire({
        title: 'Success! 🎉',
        text: 'Registration successful!',
        background: 'rgba(255, 255, 255, 0.15)',
        color: '#ffffff',
        showConfirmButton: false,
        timer: 2000,
        customClass: { popup: 'transparent-alert' }
      }).then(() => {
        navigate("/home");
      });

    } catch (error) {
      console.error("Detailed Verification Error Context:", error);
      let errorMessage = "Wrong OTP entered or expired.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      alert("Verification Wrong: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedMobile = localStorage.getItem("tempMobile");
    if (savedMobile) {
      setFormData(prev => ({ ...prev, mobile: savedMobile }));
      localStorage.removeItem("tempMobile");
    }

    const googleData = JSON.parse(localStorage.getItem("tempGoogleData"));
    if (googleData) {
      setFormData(prev => ({
        ...prev,
        name: googleData.name || "",
        email: googleData.email || ""
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
        <input type="text" name="name" placeholder="Name" className="rounded-input" value={formData.name} onChange={handleChange} disabled={loading} />
      </div>

      <div className="input-group">
        <input type="text" name="surname" placeholder="Surname" className="rounded-input" value={formData.surname} onChange={handleChange} disabled={loading} />
      </div>

      <div className="input-group">
        <input type="email" name="email" placeholder="Email ID (Optional)" className="rounded-input" value={formData.email} onChange={handleChange} disabled={loading} />
      </div>

      <div className="input-group">
        <input type="text" name="city" placeholder="Town/City" className="rounded-input" value={formData.city} onChange={handleChange} disabled={loading} />
      </div>

      <div className="input-group">
        <input 
          type="tel" name="mobile" placeholder="Mobile Number" 
          className="rounded-input" value={formData.mobile} 
          onChange={handleChange}
          disabled={isOtpSent || loading}
          maxLength="10"
        />
        {!isOtpSent && (
          <button onClick={handleSendOtp} className="otp-send-button" disabled={loading}>
            {loading ? "..." : "Send OTP"}
          </button>
        )}   
      </div>

      {isOtpSent && (
        <div className="input-group">
          <input 
            type="tel" 
            placeholder="Enter 6 digit number" 
            className="rounded-input otp-highlight" 
            maxLength="6" 
            value={otp} 
            autoFocus 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
            disabled={loading}
          />
        </div>
      )}

      <div className="terms-checkbox">
        <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} disabled={loading} />
        <label htmlFor="terms">Agree Terms & Conditions</label>
      </div>

      {!isOtpSent ? (
        <button className="continue-button1" onClick={handleSendOtp} disabled={loading}>
          {loading ? "Sending OTP..." : "Submit"} <img src={arrowImg} alt="arrow" className="arrow-icon" />
        </button>
      ) : (
        <button className="continue-button1" onClick={handleRegistrationSubmit} disabled={loading}>
          {loading ? "Registering..." : "Verify & Continue"} <img src={arrowImg} alt="arrow" className="arrow-icon" />
        </button>
      )}

      <div className="bottom-arc-container"><div className="bottom-arc-gradient"></div></div>
      <div className="center-animated-ring-wrapper2"><div className="center-animated-ring2"></div></div>
    </div>
  );
};

export default Registration;