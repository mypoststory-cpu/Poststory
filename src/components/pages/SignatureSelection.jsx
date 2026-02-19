import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import backArrow from "../../assets/lefta.png";
import editIcon from "../../assets/edit.png";
import defaultProfileImg from "../../assets/profile.jpg";
import "../styles/SignatureSelection.css";
import ringFrame from "../../assets/LogoRing.png";

import sig1 from "../../assets/PostStory Personal-01.png";
import sig2 from "../../assets/PostStory Personal-02.png";
import sig3 from "../../assets/PostStory Personal-03.png";

export default function SignatureSelection() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const savedProfile = JSON.parse(localStorage.getItem("userData")) || {};
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSig, setSelectedSig] = useState(sig1);
  const [userName, setUserName] = useState("");
  const [userSurname, setUserSurname] = useState("");
  const [userProfileImg] = useState(savedProfile.profileImage || null);

  const personalSigns = [sig1, sig2, sig3];
  const getSigIdFromImage = (img) => {
    if (img === sig1) return "sig1";
    if (img === sig2) return "sig2";
    if (img === sig3) return "sig3";
    return "default";
  };
  const handleEditOpen = (sig) => {
    setSelectedSig(sig);
    setIsEditing(true);
    
    const allData = JSON.parse(localStorage.getItem("tempEditorData")) || {};
    const sigId = getSigIdFromImage(sig);
    const currentSigData = allData[sigId] || {};
    setUserName(currentSigData.name || savedProfile.name || "");
    setUserSurname(currentSigData.surname || savedProfile.surname || "");
  };
  useEffect(() => {
    if (!isEditing) return;

    const sigId = getSigIdFromImage(selectedSig);
    const allData = JSON.parse(localStorage.getItem("tempEditorData")) || {};
    allData[sigId] = {
      name: userName,
      surname: userSurname
    };

    localStorage.setItem("tempEditorData", JSON.stringify(allData));
  }, [userName, userSurname, selectedSig, isEditing]);

  const handleFinalizeSignature = () => {
    alert("Saved! ✅");
    setIsEditing(false); 
  };

  return (
    <div className="selection-container">
      <Navbar />
    <div className="subscription-header-nav"style={{paddingLeft:'20px'}}>
          <img 
            src={backArrow} 
            alt="back" 
            className="back-btn" 
            onClick={() => navigate(-1)} 
          />
          <h3>Signature Selection</h3>
        </div>
    
      <div className="signature-main-wrapper">
        {isEditing ? (
          <div className="edit-full-preview">
            <div className="large-template-card" style={{ backgroundColor: "#b3b3b3", position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
              <img src={selectedSig} alt="template" className="template-img" style={{ position: 'absolute', zIndex: 2, width: '100%', height: '100%', top: 0, left: 0 }} />
              <div className="template-text-overlay" style={{ zIndex: 3 }}>
                <h2 className="overlay-name">{userName}</h2>
                <h2 className="overlay-subtitle">{userSurname}</h2>
              </div>
              {selectedSig === sig2 && (
                <div className="template-profile-wrapper" style={{ zIndex: 3 }}>
                  <img src={userProfileImg || defaultProfileImg} alt="profile" className="template-user-photo" />
                  <img src={ringFrame} alt="ring" className="profile-ring-overlay" />
                </div>
              )}
            </div>

            <div className="edit-inputs-group">
              <input type="text" value={userName} className="styled-input-v2" onChange={(e) => setUserName(e.target.value)} placeholder="Name" />
              <input type="text" value={userSurname} className="styled-input-v2" onChange={(e) => setUserSurname(e.target.value)} placeholder="Surname" />
            </div>

            <button className="download-btn-v3" onClick={handleFinalizeSignature}>Confirm Signature ✅</button>
          </div>
        ) : (
          <div className="sig-grid-display">
            {personalSigns.map((sig, index) => (
              <div key={index} className="sig-item-card" onClick={() => handleEditOpen(sig)}>
                <div className="sig-card-inner">
                  <img src={sig} alt="sig" className="sig-img-preview" />
                  <div className="edit-overlay-icon">
                    <img src={editIcon} alt="edit" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}