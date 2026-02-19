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

  useEffect(() => {
    const fetchHistory = async () => {
   
      const savedUser = JSON.parse(localStorage.getItem("userData"));
      if (!savedUser?.mobile) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "user_history"),
          where("mobile", "==", savedUser.mobile), 
          orderBy("timestamp", "desc") 
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          ...doc.data(),
       
          date: doc.data().timestamp?.toDate().toLocaleDateString() || "N/A",
          time: doc.data().timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ""
        }));

        setHistoryData(data);
      } catch (error) {
        console.error("Firebase Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getSocialIcon = (platform) => {
    if (platform === "whatsapp") return whatsappIcon;
    if (platform === "instagram") return instaIcon;
    return fbIcon;
  };

  return (
    <div className="history-container">
      <Navbar />
      <div className="history-header" >
      
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
                    <img src={item.img} alt="post" className="post-thumb" />
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
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>Not Found Histry.</p>
        )}
      </div>
    </div>
  );
}