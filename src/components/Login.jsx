// src/components/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Login.css';
import staticLogoImage from '../assets/Logo2.png'; 
import arrowImg from "../../src/assets/Arrow.png";

// 1. Firebase Imports
import { auth, db } from "../firebaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();
  
  // States
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);

  // 2. Setup Recaptcha (Invisible)
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  // 3. Send OTP Function
  const handleSendOtp = async () => {
    if (mobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setupRecaptcha();
      const phoneNumber = "+91" + mobileNumber;
      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      alert("OTP sent to your mobile number!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP: " + error.message);
    }
  };

  // 4. Verify OTP and Fetch User Data
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      alert("Please enter a 6-digit OTP");
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      
      // युजरचा डेटा Firestore मधून मिळवा
      const userDoc = await getDoc(doc(db, "users", mobileNumber));

      if (userDoc.exists()) {
        // डेटा सापडल्यास तो LocalStorage मध्ये सेव्ह करा
        localStorage.setItem("userData", JSON.stringify(userDoc.data()));
        localStorage.setItem("isLoggedIn", "true");
        navigate('/home');
      } else {
        // जर युजर डेटाबेसमध्ये नसेल तर त्याला रजिस्ट्रेशन पेजवर पाठवा
        alert("Mobile number not registered. Please Sign Up.");
        navigate('/registration');
      }
    } catch (error) {
      alert("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="login-container1">
      {/* Recaptcha Container (महत्वाचे) */}
      <div id="recaptcha-container"></div>

      <h2 className="header-message">Share your Post, Easily.</h2> 
   
      <div className="center-logo">
        <div className="logo-circle">
           <img src={staticLogoImage} alt="Post Story Logo" className="static-logo-image" />
        </div> 
      </div>
      
       <h3 className="head">Login</h3>
    
      {/* Mobile Input Section */}
      <div className="input-group1">
        <input 
          type="tel" 
          placeholder="Mobile number" 
          className="rounded-input1" 
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          maxLength="10"
          disabled={isOtpSent}
        />
       {!isOtpSent && (
         <img src={arrowImg} alt="send-otp" className="input-icon" onClick={handleSendOtp} />
       )}
      </div>

      {/* OTP Input Section */}
      {isOtpSent && (
        <div className="input-group1">
          <input 
            type="text" 
            placeholder="Enter OTP" 
            className="rounded-input1" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
          />
          <img src={arrowImg} alt="verify-otp" className="input-icon" onClick={handleVerifyOtp} />
        </div>
      )}
      
      {isOtpSent && <p className="resend-otp" onClick={handleSendOtp} style={{cursor: 'pointer'}}>Resend OTP</p>}

      <div className="not-registered">
        Not have an account? 
        <Link to="/registration" className="sign-up-link"> SIGN UP</Link>
      </div>

      <p className="or-sign-up">or Sign Up Using</p>
      <div className="google-login-placeholder"></div>
      
      <div className="bottom-arc-container">
        <div className="bottom-arc-gradient"></div>
      </div>
      <div className="center-animated-ring-wrapper1">
        <div className="center-animated-ring1"></div>
      </div>
    </div>
  );
};

export default Login;