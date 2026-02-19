import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../styles/PrivacyPolicy.css";
import backArrow from "../../assets/lefta.png";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
      <Navbar />

      <div className="policy-header-nav">
        <img 
          src={backArrow} 
          alt="back" 
          className="back-btn" 
          onClick={() => navigate(-1)} 
        />
        <h3>Privacy Policy</h3>
      </div>

      <div className="policy-content">
        <header className="policy-hero">
          <h1>Privacy Policy</h1>
          <p className="subtitle">Simple Sharing, Made for Everyone.</p>
          <p className="effective-date">Effective Date: February 6, 2026</p>
        </header>

        <div className="policy-scroll-area">
          <section className="policy-section">
            <p className="intro-text">
              At <strong>Post Story</strong>, we care about your privacy. This policy explains how we handle your information when you use our app to create and share social media posts.
            </p>
          </section>

          <section className="policy-section">
            <h2>1. This App is for Individuals</h2>
            <p>
              Post Story is built for individuals to share personal greetings, thoughts, and festival wishes. Currently, this app is not intended for business use. If we add business features in the future, we will update this policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. What Information We Collect</h2>
            <p>We only collect the minimum information needed to make the app work for you:</p>
            <ul className="info-list">
              <li><strong>Your Account Details:</strong> Your name and phone number or email so we can manage your 6-month free trial and your subscription.</li>
              <li><strong>Your Photos:</strong> When you add a photo to a template, we use it only to create your post. We do not use your photos for any other reason.</li>
              <li><strong>Device Info:</strong> We check your phone type and memory (RAM). This helps us make the app run fast even on budget smartphones.</li>
              <li><strong>Usage Info:</strong> We track which templates are popular so we can show you the best "Trending" designs.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Why We Need Your Information</h2>
            <p>We use your data for clear and lawful reasons:</p>
            <ul>
              <li>To let you create, save, and share your personalized posts.</li>
              <li>To make the app run quickly on your specific phone.</li>
              <li>To manage your Pro365 or Unlimited plans and subscriptions.</li>
              <li>To send your scheduled posts to WhatsApp, Facebook, or Instagram.</li>
            </ul>
          </section>

          <section className="policy-section highlight-box">
            <h2>4. We Do Not Sell Your Data</h2>
            <p>
              We do not sell your personal information to anyone. We only share your finished posts with the social media platforms (like WhatsApp or Instagram) that you choose to use.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Your Rights and Controls</h2>
            <p>You have full control over your information under the law:</p>
            <div className="rights-grid">
              <div className="right-card"><strong>Right to See:</strong> Ask what info we have.</div>
              <div className="right-card"><strong>Right to Fix:</strong> Correct wrong info.</div>
              <div className="right-card"><strong>Right to Delete:</strong> Delete your account anytime.</div>
              <div className="right-card"><strong>Right to Stop:</strong> Withdraw consent anytime.</div>
            </div>
          </section>

          <section className="policy-section">
            <h2>6. Children’s Privacy</h2>
            <p>
              If you are under 18 years old, we need verifiable permission from your parent or guardian to use your information. We do not track children or show them targeted ads.
            </p>
          </section>

          <section className="policy-section contact-section">
            <h2>7. Contact Us</h2>
            <p>If you have questions or complaints, contact our Grievance Officer:</p>
            <div className="contact-box">
              <p><strong>Email:</strong> mypoststory@gmail.com</p>
            </div>
            <p className="small-print">
              If we cannot solve your problem, you have the right to contact the Data Protection Board of India.
            </p>
          </section>

          <footer className="policy-footer">
            <p>© 2026 Post Story. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}