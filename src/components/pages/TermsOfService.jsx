import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../styles/TermsOfService.css";
import backArrow from "../../assets/lefta.png";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="terms-container">
      <Navbar />

      <div className="terms-header-nav">
        <img 
          src={backArrow} 
          alt="back" 
          className="back-btn" 
          onClick={() => navigate(-1)} 
        />
        <h3>Terms of Service</h3>
      </div>

      <div className="terms-content">
        <header className="terms-hero">
          <h1>Terms of Service</h1>
          <p className="subtitle">Simple Sharing, Made for Everyone.</p>
          <p className="effective-date">Effective Date: February 6, 2026</p>
        </header>

        <div className="terms-scroll-area">
          <section className="terms-section">
            <p className="intro-text">
              Welcome to <strong>Post Story</strong>. By using our mobile app, you agree to these rules. Please read them carefully.
            </p>
          </section>

          <section className="terms-section">
            <h2>1. This App is for Individuals</h2>
            <p>
              Post Story is currently designed for personal use by individuals to share greetings, thoughts, and festival wishes. It is not intended for commercial business use at this time. You must be at least 18 years old to use this app or have the permission of a parent or guardian.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Subscription Plans and Trial</h2>
            <div className="plan-list">
              <div className="plan-item"><strong>Free Plan:</strong> 60 posts per month and a watermark on every image.</div>
              <div className="plan-item"><strong>Pro365 Plan (₹365/Year):</strong> 120 posts per month and no watermarks.</div>
              <div className="plan-item"><strong>Unlimited Plan (₹999/Year):</strong> Unlimited posts, HD quality, VIP library access, and no watermarks.</div>
            </div>
            <p className="highlight-box">
              <strong>The "Unlimited" Free Trial:</strong> All new users receive a 3-month free trial of the Unlimited Plan. After 3 months, you can choose to pay for a plan or your account will automatically move to the Free Plan.
            </p>
            <p>
              <strong>Fair Play:</strong> Only one trial is allowed per mobile device. We use device identification to prevent users from creating multiple accounts to restart the trial.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. Your Photos and Our Templates</h2>
            <ul>
              <li><strong>Your Content:</strong> You own the photos you upload. You give us permission to use them only to create and show you your finished post.</li>
              <li><strong>Our Designs:</strong> Post Story owns all templates, icons, and designs. You may share the finished images on social media, but you cannot sell or redistribute the raw templates.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Political Kits and Compliance</h2>
            <p>Our app includes specialized frames for political parties (e.g., BJP, Congress, etc.).</p>
            <ul>
              <li><strong>User Responsibility:</strong> If you use these frames, you are solely responsible for following the Election Commission of India's (ECI) rules.</li>
              <li><strong>Neutrality:</strong> Post Story is a tool only. Providing these templates does not mean we support or endorse any specific political party or candidate.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Prohibited Use</h2>
            <p>You agree not to use Post Story to:</p>
            <ul>
              <li>Spread fake news, misinformation, or hate speech.</li>
              <li>Create content that hurts religious or social sentiments.</li>
              <li>Manually remove watermarks from the Free Plan or try to hack the post limits.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>6. Disclaimer of Liability</h2>
            <ul>
              <li><strong>Service "As-Is":</strong> We work to make the app fast on budget phones, but we provide it "as-is." We are not liable for technical downtime or loss of data.</li>
              <li><strong>Social Media Bans:</strong> We are not responsible if WhatsApp, Facebook, or Instagram limits your account based on the content you choose to share.</li>
            </ul>
          </section>

          <footer className="terms-footer">
            <p>© 2026 Post Story. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}