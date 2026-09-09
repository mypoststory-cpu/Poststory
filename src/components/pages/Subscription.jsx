import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../styles/MySubscription.css"; 
import backArrow from "../../assets/lefta.png";
import { db } from "../../firebaseConfig"; 

import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import { handleShareInvoice } from "../pages/subscriptionUtils";

import postStoryLogo from "../../assets/newlogo.png"; 

const PLAN_DETAILS = {
  free: {
    name: "Free Plan",
    price: 0,
    displayPrice: "₹0",
    duration: "",
    posts: "60 Posts",
    watermark: "Yes",
    library: "Image",
    signatures: "3 Basic",
    quality: "Standard",
    platforms: "WhatsApp",
  },
  pro: {
    name: "Pro Plan",
    price: 365,
    displayPrice: "₹365/",
    duration: "year",
    posts: "180 Posts",
    watermark: "No",
    library: "Image + Video",
    signatures: "All + Political Kits",
    quality: "High Resolution",
    platforms: "WhatsApp, FB, Insta",
  },
};

export default function MySubscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [activeTabPlan, setActiveTabPlan] = useState('pro'); 
  const [userDates, setUserDates] = useState({ regDate: "Loading...", trialEnd: "Loading..." });
  
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const [subDetails, setSubDetails] = useState({
    active: {
      planName: "Pro Plan",
      expiryDate: "Calculating...",
      status: "Active",
      planId: "pro",
      isPaid: false
    },
    history: []
  });

  // --- GST Configuration ---
  const myBusinessState = "Maharashtra";
  const userState = userData.state || "Maharashtra";
  const totalPrice = 365; 
  const taxRate = 18;

  const baseAmount = parseFloat((totalPrice / (1 + taxRate / 100)).toFixed(2));
  const totalTax = parseFloat((totalPrice - baseAmount).toFixed(2));
  const isSameState = userState.trim().toLowerCase() === myBusinessState.toLowerCase();

  useEffect(() => {
    const getSubscriptionData = async () => {
      if (!userData?.mobile) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", userData.mobile);
        const userSnap = await getDoc(userRef);
        
        let registrationDate = new Date();
        let trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 45);

        let dbStatus = "pro"; 
        let dbPlanExpiry = null;

        if (userSnap.exists()) {
          const currentUserData = userSnap.data();
          dbStatus = currentUserData.subscriptionStatus || "pro";
          dbPlanExpiry = currentUserData.planExpiryDate;

          if (currentUserData.createdAt) {
            const createdTime = currentUserData.createdAt.seconds 
              ? new Date(currentUserData.createdAt.seconds * 1000) 
              : new Date(currentUserData.createdAt);
              
            registrationDate = createdTime;
            const expiryCalc = new Date(createdTime);
            expiryCalc.setDate(expiryCalc.getDate() + 45);
            trialEndDate = expiryCalc;
          }
        }

        setUserDates({
          regDate: registrationDate.toLocaleDateString('en-IN'),
          trialEnd: trialEndDate.toLocaleDateString('en-IN')
        });

        const q = query(
          collection(db, "subscriptions"),
          where("mobile", "==", userData.mobile),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        
        // Clean up any historical plan names to avoid "(Paid)" or extra tags
        const historyData = querySnapshot.docs.map(docSnap => {
          const rawData = docSnap.data();
          let cleanName = rawData.planName || "Pro Plan";
          cleanName = cleanName.replace(/\s*\(.*?\)/g, "").trim(); // Removes anything in parentheses like (Paid) or (Trial)
          if (cleanName.toLowerCase().includes("pro")) cleanName = "Pro Plan";

          return {
            id: docSnap.id,
            ...rawData,
            plan: cleanName
          };
        });

        const now = new Date();
        let currentActivePlanId = "pro";
        let currentPlanLabel = "Pro Plan"; 
        let displayExpiry = trialEndDate.toLocaleDateString('en-IN');
        let isPaidUser = false;

        if (historyData.length > 0) {
          const latestPaidSub = historyData[0];
          const expiryDateObj = new Date(dbPlanExpiry || latestPaidSub.expiryDate);
          
          if (expiryDateObj > now) {
            currentActivePlanId = "pro";
            currentPlanLabel = "Pro Plan"; // Explicitly forced clean label
            displayExpiry = expiryDateObj.toLocaleDateString('en-IN');
            isPaidUser = true;
          } else {
            currentActivePlanId = "free";
            currentPlanLabel = "Free Plan";
            displayExpiry = "Plan Expired";
          }
        } else if (now > trialEndDate) {
          currentActivePlanId = "free";
          currentPlanLabel = "Free Plan";
          displayExpiry = "Trial Expired";
          
          if (dbStatus !== "free") {
            await updateDoc(userRef, { subscriptionStatus: "free", currentPlan: "free" });
          }
        }

        setSubDetails({
          active: {
            planName: currentPlanLabel,
            expiryDate: displayExpiry,
            status: "Active",
            planId: currentActivePlanId,
            isPaid: isPaidUser
          },
          history: historyData
        });

        setActiveTabPlan(currentActivePlanId);

      } catch (error) {
        console.error("Error loading subscription data:", error);
      } finally {
        setLoading(false);
      }
    };

    getSubscriptionData();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded || !window.Razorpay) {
        alert("Razorpay SDK failed to load.");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: "rzp_live_SZR7q4VZtc2sTV", 
        amount: totalPrice * 100, 
        currency: "INR",
        name: "Post Story",
        description: `Pro Plan Upgrade (${isSameState ? "CGST+SGST" : "IGST"} Inc.)`,
        handler: async function (response) {
          await finalizeSubscription(response.razorpay_payment_id);
        },
        prefill: {
          name: userData.name || "User",
          contact: userData.mobile || ""
        },
        theme: { color: "#3399cc" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment setup failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeSubscription = async (paymentId) => {
    try {
      const userRef = doc(db, "users", userData.mobile);
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      await updateDoc(userRef, { 
        subscriptionStatus: "pro",
        currentPlan: "pro",
        isPremium: true,                  
        planName: "Pro Plan",          
        planExpiryDate: nextYear.toISOString(),
      });

      const subDocData = {
        mobile: userData.mobile,
        planName: "Pro Plan",
        planId: "pro",
        amount: totalPrice,
        baseAmount: baseAmount,
        gstType: isSameState ? "CGST+SGST" : "IGST",
        gstAmount: totalTax,
        paymentId: paymentId,
        state: userState,
        date: new Date().toLocaleDateString('en-IN'),
        expiryDate: nextYear.toLocaleDateString('en-IN'),
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, "subscriptions"), subDocData);
     
      const docPdf = new jsPDF();
    
      try {
        docPdf.addImage(postStoryLogo, 'PNG', 15, 10, 22, 22);
      } catch (e) {
        console.error("Logo fails to render in PDF", e);
      }

      docPdf.setFont("helvetica", "normal");
      docPdf.setFontSize(14);
      docPdf.setFont("helvetica", "bold");
      docPdf.text("Allez Brandworks Pvt Ltd", 15, 38);
      
      docPdf.setFontSize(9);
      docPdf.setFont("helvetica", "normal");
      docPdf.setTextColor(80, 80, 80);
      docPdf.text("Office BR1/309, B Wing, 3rd Floor,", 15, 44);
      docPdf.text("Jai Ganesh Vision, Akurdi,", 15, 49);
      docPdf.text("Pune, Maharashtra 411035", 15, 54);
      docPdf.text("India", 15, 59);
      docPdf.setFont("helvetica", "bold");
      docPdf.text(`GSTIN : 27AAVCA3376M1ZV`, 15, 65);

      docPdf.setTextColor(0, 0, 0);
      docPdf.setFontSize(22);
      docPdf.setFont("helvetica", "light");
      docPdf.text("TAX INVOICE", 195, 22, { align: "right" });
      
      docPdf.setFontSize(10);
      docPdf.setFont("helvetica", "normal");
      docPdf.text(`#PS-${Date.now().toString().slice(-6)}`, 195, 28, { align: "right" });

      docPdf.setFillColor(248, 250, 252);
      docPdf.setDrawColor(226, 232, 240);
      docPdf.rect(145, 34, 50, 16, "FD");
      docPdf.setFontSize(8);
      docPdf.setTextColor(100, 116, 139);
      docPdf.text("Amount", 149, 40);
      docPdf.setFontSize(13);
      docPdf.setFont("helvetica", "bold");
      docPdf.setTextColor(15, 23, 42);
      docPdf.text("Rs. 365.00", 149, 47);

      docPdf.setDrawColor(229, 231, 235);
      docPdf.line(15, 71, 195, 71);

      docPdf.setTextColor(100, 116, 139);
      docPdf.setFontSize(9);
      docPdf.text("BILL TO", 15, 79);
      docPdf.setTextColor(0, 0, 0);
      docPdf.setFontSize(10);
      docPdf.text(`Customer Name: ${userData.name || "Valued Customer"}`, 15, 85);
      docPdf.text(`Place of Supply: ${userState}`, 15, 90);

      docPdf.setFontSize(9.5);
      docPdf.setTextColor(100, 116, 139);
      docPdf.text("Invoice Date:", 135, 79, { align: "right" });
      docPdf.text("Payment ID:", 135, 90, { align: "right" });

      docPdf.setTextColor(0, 0, 0);
      docPdf.text(`${new Date().toLocaleDateString('en-IN')}`, 195, 79, { align: "right" });
      docPdf.text("Due on Receipt", 195, 85, { align: "right" });
      docPdf.setFontSize(8.5);
      docPdf.text(`${paymentId}`, 195, 90, { align: "right" });

      docPdf.setFillColor(51, 65, 85);
      docPdf.rect(15, 99, 180, 8, "F");
      docPdf.setFontSize(9);
      docPdf.setTextColor(255, 255, 255);
      docPdf.setFont("helvetica", "bold");
      docPdf.text("#", 18, 104);
      docPdf.text("Item & Description", 30, 104);
      docPdf.text("Qty", 125, 104, { align: "right" });
      docPdf.text("Rate", 155, 104, { align: "right" });
      docPdf.text("Amount", 192, 104, { align: "right" });

      docPdf.setTextColor(0, 0, 0);
      docPdf.setFontSize(9.5);
      docPdf.text("1", 18, 114);
      docPdf.text("Pro Plan Subscription (1 Year)", 30, 114);
      docPdf.setFontSize(8.5);
      docPdf.setTextColor(100, 116, 139);
      docPdf.text("Access to premium templates, no watermark, and high-res downloads.", 30, 119);
      
      docPdf.setTextColor(0, 0, 0);
      docPdf.setFontSize(9.5);
      docPdf.text("1.00 pcs", 125, 114, { align: "right" });
      docPdf.text(`${baseAmount}`, 155, 114, { align: "right" });
      docPdf.text(`${baseAmount}`, 192, 114, { align: "right" });

      docPdf.setDrawColor(226, 232, 240);
      docPdf.line(15, 125, 195, 125);

      docPdf.setFontSize(9);
      docPdf.setFont("helvetica", "bold");
      docPdf.setTextColor(71, 85, 105);
      docPdf.text("Total In Words:", 15, 135);
      docPdf.setFont("helvetica", "normal");
      docPdf.setTextColor(0, 0, 0);
      docPdf.text("Indian Rupee Three Hundred Sixty-Five Only.", 15, 140);

      docPdf.setFontSize(9.5);
      docPdf.setTextColor(100, 116, 139);
      docPdf.text("Sub Total (Base Amount)", 140, 135, { align: "right" });
      docPdf.text(isSameState ? "CGST (9%)" : "IGST (18%)", 140, 141, { align: "right" });
      if (isSameState) {
        docPdf.text("SGST (9%)", 140, 147, { align: "right" });
      }

      docPdf.setTextColor(0, 0, 0);
      docPdf.text(`${baseAmount}`, 195, 135, { align: "right" });
      if (isSameState) {
        docPdf.text(`${(totalTax / 2).toFixed(2)}`, 195, 141, { align: "right" });
        docPdf.text(`${(totalTax / 2).toFixed(2)}`, 195, 147, { align: "right" });
      } else {
        docPdf.text(`${totalTax.toFixed(2)}`, 195, 141, { align: "right" });
      }

      docPdf.setFillColor(241, 245, 249);
      docPdf.rect(105, 153, 90, 8, "F");
      docPdf.setFont("helvetica", "bold");
      docPdf.text("Total", 140, 158, { align: "right" });
      docPdf.text("Rs. 365.00", 195, 158, { align: "right" });

      docPdf.setDrawColor(203, 213, 225);
      docPdf.line(15, 169, 195, 169);

      docPdf.setFontSize(9);
      docPdf.setTextColor(71, 85, 105);
      docPdf.text("Notes", 15, 177);
      docPdf.setFont("helvetica", "normal");
      docPdf.setTextColor(100, 116, 139);
      docPdf.text("Thanks for your business. This is a computer generated", 15, 183);
      docPdf.text("tax invoice and does not require a physical signature.", 15, 188);

      docPdf.save(`Invoice_${userData.mobile}.pdf`);

      alert("Success! Payment Completed & Invoice downloaded. ✅");
      window.location.reload();
    } catch (error) {
       console.error("Subscription Finalization Error: ", error);
    }
  };

  const currentTabDetails = PLAN_DETAILS[activeTabPlan] || PLAN_DETAILS.free;
  const activePlanConfig = PLAN_DETAILS[subDetails.active.planId] || PLAN_DETAILS.free;

  return (
    <div className="my-sub-container">
      <Navbar />

      <div className="my-sub-header">
        <img src={backArrow} alt="back" className="back-icon6" onClick={() => navigate(-1)} />
        <h3>My Subscription & Plans</h3>
      </div>

      <div className="my-sub-content">
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#fff' }}>Fetching Plan Details...</p>
        ) : (
          <>
            {/* Show Trial/Registration Date banner ONLY if the user is NOT a paid user */}
            {!subDetails.active.isPaid && (
              <div className="trial-info-banner" style={{
                background: '#111111', 
                padding: '12px', 
                borderRadius: '10px', 
                marginBottom: '15px',
                border: '1px dashed #ca8b37'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff' }}>
                  <span><strong>Registered Date:</strong> {userDates.regDate}</span>
                  <span><strong>45-Day Trial Ends:</strong> {userDates.trialEnd}</span>
                </div>
              </div>
            )}

            <div className="status-card" style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #000000, #c98622)', padding: '20px', borderRadius: '12px' }}>
              <span className="current-label" style={{ color: '#fff', fontSize: '12px', textTransform: 'uppercase' }}>CURRENT STATUS</span>
              <h1 className="active-plan-name" style={{ color: '#fff', margin: '5px 0', fontSize: '28px' }}>{subDetails.active.planName}</h1>
              
              <p className="expiry-text" style={{ color: '#fff', fontSize: '14px', margin: '5px 0' }}>
                Plan Expiry / End Date: {subDetails.active.expiryDate}
              </p>
              
              <div style={{ fontSize: '12px', color: '#eee', marginTop: '8px' }}>
                Limits: {activePlanConfig.posts} | Watermark: {activePlanConfig.watermark}
              </div>
            </div>

            <h3 className="main-title" style={{ textAlign: 'center', marginBottom: '15px', color: '#fff' }}>Upgrade Plan</h3>
            
            <div className="plan-comparison-card" style={{ background: '#111', borderRadius: '12px', padding: '15px', marginBottom: '20px', border: '1px solid #222' }}>
              
              <div className="plan-tabs-header" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', borderBottom: '2px solid #222' }}>
                <span 
                  className={`tab-item ${activeTabPlan === 'free' ? 'active' : ''}`} 
                  onClick={() => setActiveTabPlan('free')}
                  style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', color: activeTabPlan === 'free' ? '#c47f31' : '#666', borderBottom: activeTabPlan === 'free' ? '3px solid #bba43d' : 'none' }}
                >
                  Free Plan
                </span>
                <span 
                  className={`tab-item ${activeTabPlan === 'pro' ? 'active' : ''}`} 
                  onClick={() => setActiveTabPlan('pro')}
                  style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', color: activeTabPlan === 'pro' ? '#b9882c' : '#666', borderBottom: activeTabPlan === 'pro' ? '3px solid #bba43d' : 'none' }}
                >
                  Pro Plan
                </span>
              </div>

              <div className="comparison-table">
                <div className="table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' }}>
                  <span className="row-label" style={{ whiteSpace: 'nowrap', color: '#aaa' }}>Monthly Posts</span>
                  <span className="row-value" style={{ whiteSpace: 'nowrap', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}>{currentTabDetails.posts}</span>
                </div>
                <div className="table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' }}>
                  <span className="row-label" style={{ whiteSpace: 'nowrap', color: '#aaa' }}>Watermark</span>
                  <span className="row-value" style={{ whiteSpace: 'nowrap', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}>{currentTabDetails.watermark}</span>
                </div>
                <div className="table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' }}>
                  <span className="row-label" style={{ whiteSpace: 'nowrap', color: '#aaa' }}>Library Access</span>
                  <span className="row-value" style={{ whiteSpace: 'nowrap', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}>{currentTabDetails.library}</span>
                </div>
                <div className="table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' }}>
                  <span className="row-label" style={{ whiteSpace: 'nowrap', color: '#aaa' }}>Signatures</span>
                  <span className="row-value" style={{ whiteSpace: 'nowrap', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}>{currentTabDetails.signatures}</span>
                </div>
                <div className="table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' }}>
                  <span className="row-label" style={{ whiteSpace: 'nowrap', color: '#aaa' }}>Image Quality</span>
                  <span className="row-value" style={{ whiteSpace: 'nowrap', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}>{currentTabDetails.quality}</span>
                </div>
                <div className="table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <span className="row-label" style={{ whiteSpace: 'nowrap', color: '#aaa' }}>Platforms</span>
                  <span className="row-value" style={{ whiteSpace: 'nowrap', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}>{currentTabDetails.platforms}</span>
                </div>
              </div>
            </div>

            <div className="annual-banner" style={{ textAlign: 'center', background: '#1c1c1c', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
                <span className="annual-text" style={{ fontSize: '13px', color: '#dbbc2f', fontWeight: 'bold', textTransform: 'uppercase' }}>ANNUAL PACKAGE</span>
                <div className="price-wrapper" style={{ marginTop: '5px' }}>
                    <span className="annual-price" style={{ fontSize: '26px', fontWeight: 'bold', color: '#fff' }}>
                      {currentTabDetails.displayPrice} <small style={{ fontSize: '14px', color: '#aaa' }}>{currentTabDetails.duration}</small>
                    </span>
                    {activeTabPlan === 'pro' && (
                       <div className="gst-label" style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                         (Incl. 18% GST - {isSameState ? "CGST + SGST" : "IGST"})
                       </div>
                    )}
                </div>
            </div>

            {activeTabPlan === 'pro' && !subDetails.active.isPaid && (
              <button className="subscribe-pay-btn" onClick={handlePayment} disabled={isProcessing} style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg, #c0883e, #696252)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '30px' }}>
                {isProcessing ? "Processing..." : "Subscribe & Pay Now"}
              </button>
            )}

            {subDetails.active.isPaid && activeTabPlan === 'pro' && (
              <p style={{ textAlign: 'center', color: '#4caf50', fontWeight: 'bold', marginBottom: '30px' }}>✓ You are already a Paid Pro User</p>
            )}

            <hr style={{ borderColor: '#222', margin: '25px 0' }} />
            <div className="history-section">
              <h4 style={{ color: '#fff', marginBottom: '10px' }}>Subscription History</h4>
              <div className="history-list">
                {subDetails.history.length > 0 ? (
                  subDetails.history.map((item) => {
                    const invoiceUrl = `${window.location.origin}/invoice/${item.paymentId || item.id}`;
                    
                    return (
                      <div key={item.id} className="history-card" style={{ background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #222' }}>
                        <div className="history-main" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#fff' }}>
                          <span className="hist-plan">{item.plan}</span>
                          <span className="hist-amount">₹{item.amount}</span>
                        </div>
                        <div className="history-footer" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '5px' }}>
                          <span>Date: {item.date}</span>
                          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Success</span>
                        </div>

                        {/* Invoice Button */}
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #222', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleShareInvoice(invoiceUrl, userData.mobile, userData.email)}
                            style={{
                              padding: '6px 12px',
                              background: '#333',
                              color: '#dbbc2f',
                              border: '1px solid #ca8b37',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            📄 View & Share Invoice
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ fontSize: '13px', color: '#555', textAlign: 'center' }}>No paid transactions found.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}