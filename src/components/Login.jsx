import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import staticLogoImage from "../assets/Logo2.png";
import arrowImg from "../../src/assets/Arrow.png";
import Swal from 'sweetalert2';
import { checkAdmin } from "../checkAdmin";
import axios from "axios";

// Firebase Firestore
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();

  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cloud Functions Base URL (Matches your Registration component)
  const REGION_URL = "https://us-central1-allezpoststory.cloudfunctions.net";

 const handleSendOtp = async () => {
    try {
      setLoading(true);
      const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10); 
      
      if (cleanMobile.length < 10) {
        alert("Please enter a valid 10-digit number.");
        setLoading(false);
        return;
      }

      // Call Firebase Cloud Function to send SMS via Twilio
      const response = await axios.post(`${REGION_URL}/sendTwilioOTP`, {
        phone: `+91${cleanMobile}`
      });

      if (response.data.success) {
        // REMOVED: Frontend no longer needs to write to Firestore here, 
        // because your backend cloud function already safely saved the OTP code!

        setIsOtpSent(true);
        Swal.fire({
          title: 'OTP sent successfully! 📱',
          background: 'rgba(255, 255, 255, 0.2)', 
          color: '#ffffff',
          backdrop: 'rgba(0, 0, 0, 0.4)', 
          showConfirmButton: false,
          timer: 2000,
          customClass: { popup: 'transparent-alert' }
        });
      }
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };
const handleVerifyOtp = async () => {
    // 10-digit format for Firestore users collection & admin check
    const rawMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    // +91 format for the OTP collection lookup
    const cleanPhone = `+91${rawMobile}`; 
    const cleanOtp = otp.replace(/\s/g, '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }
    
    setLoading(true);

    try {
      // Verify OTP from Firestore using the +91 format
      const docRef = await getDoc(doc(db, "otps", cleanPhone));

      if (!docRef.exists()) {
        alert("OTP expired or not found.");
        setLoading(false);
        return;
      }

      const data = docRef.data();
      if (data.otp !== cleanOtp) {
        alert("Invalid OTP entered.");
        setLoading(false);
        return;
      }

      // Delete OTP after successful verification
      await deleteDoc(doc(db, "otps", cleanPhone));

    } catch (authError) {
      console.error("Code Verification Failed:", authError);
      alert("Wrong OTP entered or expired. Please check.");
      setLoading(false);
      return; 
    }

    try {
      // ADMIN CHECK (uses 10-digit rawMobile)
      const isAdminStatus = await checkAdmin(rawMobile); 

      if (isAdminStatus === true) {
        localStorage.setItem("userPhone", rawMobile);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdmin", "true");
        alert("Admin Access Granted! ✅");
        navigate("/home"); 
        return;
      }

      // FIRESTORE USER CHECK (uses 10-digit rawMobile to match your screenshot)
      const userDoc = await getDoc(doc(db, "users", rawMobile));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("userPhone", rawMobile);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.removeItem("isAdmin");
        
        navigate("/home");
      } else {
        alert("Your number is not registered. Redirecting to Registration.");
        localStorage.setItem("tempMobile", rawMobile);
        navigate("/registration");
      }

    } catch (dbError) {
      console.error("Database Check Error:", dbError);
      alert("Database error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container1">
      <div className="top-bar"></div>
      <h2 className="header-message">Share your Post, Easily.</h2>

      <div className="center-logo">
        <div className="logo-circle">
          <img src={staticLogoImage} alt="Logo" className="static-logo-image" />
        </div>
      </div>

      <h3 className="head">Login</h3>

      <div className="input-group1">
        <input
          type="tel"
          placeholder="Mobile number"
          className="rounded-input1"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} 
          maxLength="10"
          disabled={isOtpSent || loading}
        />
        <img
          src={arrowImg}
          alt="send"
          className="input-icon"
          onClick={!loading ? handleSendOtp : null}
          style={{ cursor: loading ? "not-allowed" : "pointer" }}
        />
      </div>

      <div className="input-group1">
        <input
          type="tel"
          placeholder="OTP"
          className="rounded-input1"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          maxLength="6"
          disabled={!isOtpSent || loading}
        />
        <img
          src={arrowImg}
          alt="verify"
          className="input-icon"
          onClick={!loading ? handleVerifyOtp : null}
          style={{ cursor: loading ? "not-allowed" : "pointer" }}
        />
      </div>

      <p className="resend-otp" onClick={!loading ? handleSendOtp : null}>
        {loading ? "Please wait..." : "Resend OTP"}
      </p>

      <div className="not-registered">
        Not have an account? <p></p>
        <Link to="/registration" className="sign-up-link">SIGN UP</Link>
      </div>
 
      <div className="bottom-arc-container"><div className="bottom-arc-gradient"></div></div>
      <div className="center-animated-ring-wrapper1"><div className="center-animated-ring1"></div></div>
    </div>
  );
};

export default Login;