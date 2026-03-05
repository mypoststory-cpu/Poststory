// src/components/Login.jsx

import React, { useState , useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import staticLogoImage from "../assets/PostoryLogo_W.png";
import arrowImg from "../../src/assets/Arrow.png";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { checkAdmin } from "../checkAdmin";
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,      // Add this
  signInWithPhoneNumber    // Add this
} from "firebase/auth";

// Firebase
import { auth, db } from "../firebaseConfig";

import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();

  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Setup Recaptcha
 const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container", // Make sure this ID matches your <div> id
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      }
    );
  }
};

  // Send OTP
  const handleSendOtp = async () => {
    if (mobileNumber.length !== 10) {
      alert("Please enter a 10-digit mobile number");
      return;
    }

    try {
      setupRecaptcha();
      const phoneNumber = "+91" + mobileNumber;
      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      setConfirmationResult(result);
      setIsOtpSent(true);
      alert("OTP sent!");
    } catch (error) {
      console.error(error);
      alert("Failed to send OTP");
    }
  };

const handleVerifyOtp = async () => {
  if (!confirmationResult) {
    alert("Please request OTP first");
    return;
  }

  try {
    // 1. Confirm OTP
    await confirmationResult.confirm(otp);

    // 2. IMPORTANT: You must 'await' the result of checkAdmin
    // Since your DB has "9860098958", this will now return true
    const isAdminStatus = await checkAdmin(mobileNumber); 

    if (isAdminStatus === true) {
      // Clear any old user data and set Admin flags
      localStorage.setItem("userPhone", mobileNumber);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "true");
      
      alert("Admin Access Granted! ✅");
      
      // Navigate to the Bulk Upload page
      navigate("/admin-bulk-upload"); 
      return; // Stop the function here so it doesn't run the 'user' logic below
    }

    // 3. This part ONLY runs if isAdminStatus is false
    const userDoc = await getDoc(doc(db, "users", mobileNumber));

    if (userDoc.exists()) {
      localStorage.setItem("userData", JSON.stringify(userDoc.data()));
      localStorage.setItem("userPhone", mobileNumber);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.removeItem("isAdmin"); // Ensure they are not marked as admin
      navigate("/home");
    } else {
      alert("Number not registered. Please Sign Up.");
      navigate("/registration");
    }

  } catch (error) {
    console.error("Login Error:", error);
    alert("Invalid OTP or Verification Failed");
  }
};
const handleGoogleLogin = async () => {
  try {
    await GoogleAuth.initialize({
      clientId: '882147774912-7fsnctiqv4h0gqmthd5r65b7lv25kc5a.apps.googleusercontent.com',
    });

    const googleUser = await GoogleAuth.signIn();
    const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    // Check kara ki ha email user collection madhe aahe ka?
    const q = query(collection(db, "users"), where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // User aadhi pasun aahe, direct login
      const userData = querySnapshot.docs[0].data();
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
      navigate("/home");
    } else {

      const tempGoogleData = {
        name: user.displayName,
        email: user.email,
        profileImage: user.photoURL
      };
      localStorage.setItem("tempGoogleData", JSON.stringify(tempGoogleData));
      
  
      navigate("/registration");
    }
  } catch (error) {
    console.error("Google Login Error:", error);
  }
};
  return (
    <div className="login-container1">
      <div id="recaptcha-container"></div>

      <div className="top-bar"></div>

      <h2 className="header-message">Share your Post, Easily.</h2>

      <div className="center-logo">
        <div className="logo-circle">
          <img
            src={staticLogoImage}
            alt="Post Story Logo"
            className="static-logo-image"
          />
        </div>
      </div>

      <h3 className="head">Login</h3>

      {/* Mobile Input */}
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
        <img
          src={arrowImg}
          alt="arrow"
          className="input-icon"
          onClick={handleSendOtp}
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* OTP Input */}
      <div className="input-group1">
        <input
          type="text"
          placeholder="OTP"
          className="rounded-input1"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
        />
        <img
          src={arrowImg}
          alt="arrow"
          className="input-icon"
          onClick={handleVerifyOtp}
          style={{ cursor: "pointer" }}
        />
      </div>

      <p
        className="resend-otp"
        onClick={handleSendOtp}
        style={{ cursor: "pointer" }}
      >
        Resend OTP
      </p>

      <div className="not-registered">
        Not have an account?
        <Link to="/registration" className="sign-up-link">
          SIGN UP
        </Link>
      </div>

      <p className="or-sign-up">or Sign Up Using</p>

      <div className="google-login-placeholder" onClick={handleGoogleLogin}>
     
      </div>

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