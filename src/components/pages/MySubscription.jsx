import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../styles/MySubscription.css";
import backArrow from "../../assets/lefta.png";
// Import Firebase tools
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";


const PLAN_DETAILS = {
  free: { name: "Free Plan", posts: "60 Posts", watermark: "Yes" },
  pro: { name: "Pro Plan", posts: "120 Posts", watermark: "No" },
  priority: { name: "Priority Plan", posts: "Unlimited", watermark: "No" }
};

export default function MySubscription() { 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [subDetails, setSubDetails] = useState({
    active: {
      planName: "Free Plan",
      expiryDate: "N/A",
      status: "Active",
      planId: "free"
    },
    history: []
  });
  // Inside MySubscription.jsx useEffect
const savedUser = JSON.parse(localStorage.getItem("userData"));
if (!savedUser?.mobile) {
    alert("Please update your mobile number in Profile to see subscriptions.");
    navigate("/profile");
    return;
}

  useEffect(() => {
    const getSubscriptionData = async () => {
      const savedUser = JSON.parse(localStorage.getItem("userData"));
      if (!savedUser?.mobile) {
        setLoading(false);
        return;
      }

      try {

        const q = query(
          collection(db, "subscriptions"),
          where("mobile", "==", savedUser.mobile),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
       
          plan: doc.data().planName || "Unknown Plan"
        }));

        if (historyData.length > 0) {
          const latest = historyData[0];
          setSubDetails({
            active: {
              planName: latest.planName,
              expiryDate: latest.expiryDate || "Lifetime",
              status: "Active",
              planId: latest.planId || "free"
            },
            history: historyData
          });
        }
      } catch (error) {
        console.error("Error loading subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    getSubscriptionData();
  }, []);


  const currentPlan = PLAN_DETAILS[subDetails.active.planId] || PLAN_DETAILS.free;

  return (
    <div className="my-sub-container">
      <Navbar />

      <div className="my-sub-header">
        <img src={backArrow} alt="back" className="back-btn" onClick={() => navigate(-1)} />
        <h3>My Subscription</h3>
      </div>

      <div className="my-sub-content">
        {loading ? (
          <p style={{textAlign: 'center', marginTop: '20px'}}>Fetching Plan Details...</p>
        ) : (
          <>
            {/* Current Active Plan */}
            <div className="status-card">
              <span className="current-label">Active Plan</span>
              <h1 className="active-plan-name">{subDetails.active.planName}</h1>
              <p className="expiry-text">Expires on: {subDetails.active.expiryDate}</p>
              
          
              <div style={{fontSize: '12px', marginTop: '10px',marginBottom:'10px', opacity: 0.8}}>
                Limits: {currentPlan.posts} | Watermark: {currentPlan.watermark}
              </div>
              
              <span className="status-badge">Active</span>
            </div>

            <div className="history-section">
              <h4>Subscription History</h4>
              <div className="history-list">
                {subDetails.history.length > 0 ? (
                  subDetails.history.map((item) => (
                    <div key={item.id} className="history-card">
                      <div className="history-main">
                        <span className="hist-plan">{item.plan}</span>
                        <span className="hist-amount">{item.amount || "₹0"}</span>
                      </div>
                      <div className="history-footer">
                        <span>{item.date}</span>
                        <span className={`hist-status ${item.status?.toLowerCase() || 'completed'}`}>
                          {item.status || "Completed"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{fontSize: '13px', color: '#888'}}>No subscription history found.</p>
                )}
              </div>
            </div>

            <button className="upgrade-btn" onClick={() => navigate("/subscription")}>
              Change or Upgrade Plan
            </button>
          </>
        )}
      </div>
    </div>
  );
}