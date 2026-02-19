import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../styles/MySubscription.css";
import backArrow from "../../assets/lefta.png";

export default function MySubscription() {
  const navigate = useNavigate();


  const [subDetails] = useState({
    active: {
      planName: "Pro365 Plan",
      expiryDate: "Feb 06, 2027",
      status: "Active"
    },
    history: [
      { id: 1, plan: "Pro365 Plan", date: "Feb 06, 2025", amount: "₹365", status: "Completed" },
      { id: 2, plan: "Free Trial (3 Months)", date: "Nov 06, 2024", amount: "₹0", status: "Expired" }
    ]
  });

  return (
    <div className="my-sub-container">
      <Navbar />

      <div className="my-sub-header">
        <img src={backArrow} alt="back" className="back-btn" onClick={() => navigate(-1)} />
        <h3>My Subscription</h3>
      </div>

      <div className="my-sub-content">
        {/* Current Active Plan */}
        <div className="status-card">
          <span className="current-label">Active Plan</span>
          <h1 className="active-plan-name">{subDetails.active.planName}</h1>
          <p className="expiry-text">Expires on: {subDetails.active.expiryDate}</p>
          <span className="status-badge">Active</span>
        </div>

        {/* Subscription History Section */}
        <div className="history-section">
          <h4>Subscription History</h4>
          <p className="sub-info-text"></p>
          
          <div className="history-list">
            {subDetails.history.map((item) => (
              <div key={item.id} className="history-card">
                <div className="history-main">
                  <span className="hist-plan">{item.plan}</span>
                  <span className="hist-amount">{item.amount}</span>
                </div>
                <div className="history-footer">
                  <span>{item.date}</span>
                  <span className={`hist-status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="upgrade-btn" onClick={() => navigate("/subscription")}>
          Change or Upgrade Plan
        </button>
      </div>
    </div>
  );
}