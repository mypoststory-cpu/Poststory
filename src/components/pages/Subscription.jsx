import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../styles/Subscription.css";
import backArrow from "../../assets/lefta.png";

export default function Subscription() {
  const navigate = useNavigate();


  const [activePlan, setActivePlan] = useState('free');

  const planData = {
    free: {
      name: "Free Plan",
      price: "₹0",
      duration: "",
      monthlyPosts: "60 Posts",
      watermark: "Yes",
      library: "Standard",
      signatures: "3 Basic",
      quality: "Standard",
      platforms: "WhatsApp",
      support: "Standard"
    },
    pro: {
      name: "Pro Plan",
      price: "₹365/",
      duration: "year",
      monthlyPosts: "120 Posts",
      watermark: "No",
      library: "Standard + Newest",
      signatures: "All + Political Kits",
      quality: "Standard",
      platforms: "WhatsApp, FB, Insta",
      support: "Standard"
    },
    priority: {
      name: "Priority Plan",
      price: "₹999/",
      duration: "year",
      monthlyPosts: "Unlimited",
      watermark: "No",
      library: "VIP (Full Access)",
      signatures: "All + Political Kits",
      quality: "High-Definition (HD)",
      platforms: "WhatsApp, FB, Insta",
      support: "Priority Support"
    }
  };
const handleSubscription = (planType) => {
    const updatedData = {
        ...userData,
        currentPlan: planType, 
    };
    localStorage.setItem("userData", JSON.stringify(updatedData));
    alert(`${planType} plan activated!`);
};
  const current = planData[activePlan];

  return (
    <div className="subscription-container">
      <Navbar />

      <div className="subscription-header-nav">
        <img 
          src={backArrow} 
          alt="back" 
          className="back-btn" 
          onClick={() => navigate(-1)} 
        />
        <h3>Buy Plan</h3>
      </div>

      <div className="subscription-content">
        <h1 className="main-title">Buy Plan</h1>

        <div className="plan-comparison-card">
          {/* Plan Navigation Tabs */}
          <div className="plan-tabs-header">
            <span 
              className={`tab-item ${activePlan === 'free' ? 'active' : ''}`}
              onClick={() => setActivePlan('free')}
            >
              Free Plan
            </span>
            <span 
              className={`tab-item ${activePlan === 'pro' ? 'active' : ''}`}
              onClick={() => setActivePlan('pro')}
            >
              Pro Plan
            </span>
            <span 
              className={`tab-item ${activePlan === 'priority' ? 'active' : ''}`}
              onClick={() => setActivePlan('priority')}
            >
              Priority Plan
            </span>
          </div>

          {/* Dynamic Comparison Table */}
          <div className="comparison-table">
            <div className="table-row">
              <span className="row-label">Monthly Posts</span>
              <span className="row-value">{current.monthlyPosts}</span>
            </div>
            <div className="table-row">
              <span className="row-label">Watermark</span>
              <span className="row-value">{current.watermark}</span>
            </div>
            <div className="table-row">
              <span className="row-label">Library Access</span>
              <span className="row-value">{current.library}</span>
            </div>
            <div className="table-row">
              <span className="row-label">Signatures</span>
              <span className="row-value">{current.signatures}</span>
            </div>
            <div className="table-row">
              <span className="row-label">Image Quality</span>
              <span className="row-value">{current.quality}</span>
            </div>
            <div className="table-row">
              <span className="row-label">Platforms</span>
              <span className="row-value">{current.platforms}</span>
            </div>
            <div className="table-row">
              <span className="row-label">Support</span>
              <span className="row-value">{current.support}</span>
            </div>
          </div>
        </div>

   
        <div className="annual-banner">
           <span className="annual-text">Annual</span>
           <span className="annual-price">
             {current.price} <small>{current.duration}</small>
           </span>
        </div>

   
        {activePlan  && (
          <button className="subscribe-pay-btn">
            Subscribe & Pay
          </button>
        )}
      </div>
    </div>
  );
}