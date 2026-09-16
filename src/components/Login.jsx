import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import staticLogoImage from "../assets/Logo2.png";
import arrowImg from "../../src/assets/Arrow.png";
import Swal from 'sweetalert2';
import { checkAdmin } from "../checkAdmin";

// Firebase Firestore & Native Capacitor Auth
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const Login = () => {
  const navigate = useNavigate();

  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState("");


// Send real-time OTP via Native Capacitor Firebase Auth
// Send real-time OTP via Native Capacitor Firebase Auth
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);  
      
      if (cleanMobile.length < 10) {
        alert("Please enter a valid 10-digit number.");
        setLoading(false);
        return;
      }

      const phoneNumber = `+91${cleanMobile}`;
      console.log("Attempting native login for:", phoneNumber);

      // Native phone auth call
      const result = await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber: phoneNumber,
      });

      console.log("Full Result Object from Native:", JSON.stringify(result));

      // Flexible check to catch verificationId across different plugin structures
      const vId = result?.verificationId || result?.credential?.verificationId || result?.code;

      // Even if vId is structured differently, if result comes back successfully, allow entering OTP
      if (result) {
        setVerificationId(vId || "bypass_id"); 
        setIsOtpSent(true); // This unlocks your OTP input box!

        Swal.fire({
          title: 'OTP sent successfully! 📱',
          background: 'rgba(255, 255, 255, 0.2)', 
          color: '#ffffff',
          backdrop: 'rgba(0, 0, 0, 0.4)', 
          showConfirmButton: false,
          timer: 2000,
          customClass: { popup: 'transparent-alert' }
        });
      } else {
        throw new Error("verificationId is missing from the response.");
      }

    } catch (error) {
      console.error("Firebase Native SMS Auth Error:", error);
      const errorMessage = error.message ? error.message : JSON.stringify(error);
      alert("Auth Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // Verify code using Native confirmation
  const handleVerifyOtp = async () => {
    const rawMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    const cleanOtp = otp.replace(/\s/g, '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }
    
    setLoading(true);

    try {
      // Confirm credentials natively
      await FirebaseAuthentication.signInWithCredential({
        verificationId: verificationId,
        smsCode: cleanOtp,
      });

      // ADMIN CHECK
      const isAdminStatus = await checkAdmin(rawMobile); 

      if (isAdminStatus === true) {
        localStorage.setItem("userPhone", rawMobile);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdmin", "true");
        alert("Admin Access Granted! ✅");
        navigate("/home"); 
        return;
      }

      // FIRESTORE USER CHECK
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

    } catch (authError) {
      console.error("Code Verification Failed:", authError);
      alert("Wrong OTP entered or expired. Please check.");
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