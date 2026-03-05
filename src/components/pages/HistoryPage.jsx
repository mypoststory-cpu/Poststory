import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import "../styles/HistoryPage.css";
import Navbar from "../Navbar";
import backArrow from "../../assets/lefta.png";

const whatsappIcon = "https://cdn-icons-png.flaticon.com/512/733/733585.png";
const instaIcon = "https://cdn-icons-png.flaticon.com/512/174/174855.png";
const fbIcon = "https://cdn-icons-png.flaticon.com/512/124/124010.png";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState(null); // State for image modal

  useEffect(() => {
    const fetchHistory = async () => {
      const savedUser = JSON.parse(localStorage.getItem("userData"));
      if (!savedUser?.mobile) return;

      // Calculate the date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      try {
        const q = query(
          collection(db, "user_history"),
          where("mobile", "==", savedUser.mobile),
          where("timestamp", ">=", thirtyDaysAgo), // Filter for last 30 days
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data());
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);
const handleImageClick = (item) => {
  navigate("/post-selection", { 
    state: {
      postImg: item.img,
      categoryName: item.category || "Daily Post",
      subCategory: item.sub || "Share"
    }
  });
};
  const getSocialIcon = (platform) => {
    if (platform === "whatsapp") return whatsappIcon;
    if (platform === "instagram") return instaIcon;
    return fbIcon;
  };

  return (
    <div className="history-container">
      <Navbar />
      <div className="history-header">
        <img
          src={backArrow}
          alt="back"
          className="back-icon1"
          onClick={() => window.history.back()}
        />
        <h3>History</h3>
      </div>

      <div className="history-content">
        {loading ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>Loading History...</p>
        ) : historyData.length > 0 ? (
          <>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Date</th>
                  <th>Social</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item, index) => (
                  <tr key={index}>
                    <td className="post-cell">
                     <img 
  src={item.img} 
  alt="post" 
  className="post-thumb" 
  onClick={() => handleImageClick(item)} 
  style={{ cursor: 'pointer' }}
/>
                      <div className="post-info">
                        <span className="p-cat">{item.category}</span>
                        <span className="p-sub">{item.sub}</span>
                      </div>
                    </td>
                    <td className="date-cell">
                      <div>{item.date}</div>
                      <div className="time-text">{item.time}</div>
                    </td>
                    <td className="social-cell">
                      <img src={getSocialIcon(item.platform)} alt="social" className="social-icon-img" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Image Preview Modal */}
            {selectedPreview && (
              <div className="image-modal-overlay" onClick={() => setSelectedPreview(null)}>
               {/* Inside the modal-content div in HistoryPage.jsx */}
<div className="modal-content" onClick={(e) => e.stopPropagation()}>
  <span className="close-modal" onClick={() => setSelectedPreview(null)}>&times;</span>
  <img src={selectedPreview.img} alt="Full Preview" className="full-preview-img" />
  
  {/* Added Edit Button */}
  <button 
    className="edit-from-history-btn"
    onClick={() => handleImageClick(selectedPreview)}
  >
    Edit this Style
  </button>
</div>
              </div>
            )}
          </>
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>Not Found History.</p>
        )}
      </div>
    </div>
  );
}