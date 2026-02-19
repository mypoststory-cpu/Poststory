import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import "../styles/PostSelection.css";
import Navbar from "../Navbar";
import editIcon from '../../assets/edit.png';
import defaultUserPhoto from "../../assets/profile.jpg";
import backArrow from "../../assets/lefta.png";
import { sharePost } from "./shareService";


// Personal Assets
import sig1 from "../../assets/PostStory Personal-01.png";
import sig2 from "../../assets/PostStory Personal-02.png";
import sig3 from "../../assets/PostStory Personal-03.png";
import sig4 from "../../assets/PostStory Personal-04.png";
import sig5 from "../../assets/PostStory Personal-05.png";
import sig6 from "../../assets/PostStory Personal-06.png";

// Icons
import whatsappIcon from "../../assets/w.png";
import instagramIcon from "../../assets/i.png";
import facebookIcon from "../../assets/f.png";

// Political Assets
import bjp1 from "../../assets/political/bjp.png";
import bjp2 from "../../assets/political/bjp 2.png";
import bjp3 from "../../assets/political/bjp 3.png";
import shiv1 from "../../assets/political/shiv.png";
import shiv2 from "../../assets/political/shiv 2.png";
import shiv3 from "../../assets/political/shiv 3.png";
import ajit1 from "../../assets/political/congress Ajit.png";
import ajit2 from "../../assets/political/congress Ajit 2.png";
import ajit3 from "../../assets/political/congress Ajit 3.png";
import shivsena1 from "../../assets/political/shiv udhav.png";
import shivsena2 from "../../assets/political/shiv udhav 2.png";
import shivsena3 from "../../assets/political/shiv udhav 3.png";
import congress1 from "../../assets/political/congress.png";
import congress2 from "../../assets/political/congress 2.png";
import congress3 from "../../assets/political/congress 3.png";
import sharad1 from "../../assets/political/sharad.png";
import sharad2 from "../../assets/political/sharad 2.png";
import sharad3 from "../../assets/political/sharad 3.png";
import mns1 from "../../assets/political/mns 1.png";
import mns2 from "../../assets/political/mns 2.png";
import mns3 from "../../assets/political/mns 3.png";
import vba1 from "../../assets/political/vba 1.png";
import vba2 from "../../assets/political/vba 2.png";
import vba3 from "../../assets/political/vba 3.png";
import bva1 from "../../assets/political/bva 1.png";
import bva2 from "../../assets/political/bva 2.png";
import bva3 from "../../assets/political/bva 3.png";
import pwp1 from "../../assets/political/pwp.png";
import pwp2 from "../../assets/political/pwp 2.png";
import pwp3 from "../../assets/political/pwp 3.png";
import aimim1 from "../../assets/political/AIMIM 1.png";
import aimim2 from "../../assets/political/AIMIM 2.png";
import aimim3 from "../../assets/political/AIMIM 3.png";
import sp1 from "../../assets/political/SP 1.png";
import sp2 from "../../assets/political/SP 2.png";
import sp3 from "../../assets/political/SP 3.png";
import rpi1 from "../../assets/political/RPI 1.png";
import rpi2 from "../../assets/political/RPI 2.png";
import rpi3 from "../../assets/political/RPI 3.png";
import prahar1 from "../../assets/political/PRAHAR 1.png";
import prahar2 from "../../assets/political/PRAHAR 2.png";
import prahar3 from "../../assets/political/PRAHAR 3.png";
import rsp1 from "../../assets/political/RSP 1.png";
import rsp2 from "../../assets/political/rps.png";
import rsp3 from "../../assets/political/RSP 3.png";

const getInitialValue = (field) => {
    const allSavedData = JSON.parse(localStorage.getItem("tempEditorData")) || {};
    const savedProfile = JSON.parse(localStorage.getItem("userData")) || {};
    const sigId = "sig1"; 

    if (allSavedData[sigId] && allSavedData[sigId][field]) {
        return allSavedData[sigId][field];
    }
    return savedProfile[field === 'name' ? 'name' : 'surname'] || (field === 'name' ? "Name" : "Subtitle");
};

export default function PostSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const postRef = useRef(null);

    const { postImg, categoryName, subCategory } = location.state || {};
    const savedProfile = JSON.parse(localStorage.getItem("userData")) || {};
    const currentPlan = savedProfile.currentPlan || "free"; 

    const [selectedSig, setSelectedSig] = useState(sig1);
    const [userName, setUserName] = useState(() => getInitialValue('name'));
    const [userSubtitle, setUserSubtitle] = useState(() => getInitialValue('surname'));
    const [userPhoto] = useState(savedProfile.profileImage || defaultUserPhoto);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [customMessage, setCustomMessage] = useState("");
    const [activeTab, setActiveTab] = useState("personal");
    const [selectedParty, setSelectedParty] = useState("BJP");

    const personalSigns = [sig1, sig2, sig3, sig4, sig5, sig6];
    const partyTemplates = {
        "BJP": [bjp1, bjp2, bjp3], "SHINDE": [shiv1, shiv2, shiv3], "AJIT": [ajit1, ajit2, ajit3],
        "UBT": [shivsena1, shivsena2, shivsena3], "INC": [congress1, congress2, congress3],
        "SHARAD": [sharad1, sharad2, sharad3], "MNS": [mns1, mns2, mns3], "VBA": [vba1, vba2, vba3],
        "BVA": [bva1, bva2, bva3], "PWP": [pwp1, pwp2, pwp3], "AIMIM": [aimim1, aimim2, aimim3],
        "SP": [sp1, sp2, sp3], "RPI": [rpi1, rpi2, rpi3], "PRAHAR": [prahar1, prahar2, prahar3], "RSP": [rsp1, rsp2, rsp3]
    };

   
    const allowedProfileSigs = [
        sig2, bjp1, bjp3, shiv1, shiv3, ajit1, ajit3, shivsena1, shivsena3, 
        congress1, congress3, sharad1, sharad3, mns1, mns3, vba1, vba3, 
        bva1, bva3, pwp1, pwp3, aimim1, aimim3, sp1, sp3, rpi1, rpi3, 
        prahar1, prahar3, rsp1, rsp3
    ];
const availablePersonalSigns = currentPlan === "free" ? personalSigns.slice(0, 3) : personalSigns;
    const getSigId = (sig) => {
        if (sig === sig1) return "sig1";
        if (sig === sig2) return "sig2";
        if (sig === sig3) return "sig3";
        if (sig === sig4) return "sig4";
        if (sig === sig5) return "sig5";
        if (sig === sig6) return "sig6";
        for (let party in partyTemplates) {
            const index = partyTemplates[party].indexOf(sig);
            if (index !== -1) return `${party.toLowerCase()}${index + 1}`;
        }
        return "default";
    };

    useEffect(() => {
        const sigId = getSigId(selectedSig);
        const allSavedData = JSON.parse(localStorage.getItem("tempEditorData")) || {};
        if (allSavedData[sigId]) {
            setUserName(allSavedData[sigId].name);
            setUserSubtitle(allSavedData[sigId].surname);
        } else {
            setUserName(savedProfile.name || "Name");
            setUserSubtitle(savedProfile.surname || "Subtitle");
        }
    }, [selectedSig]);

    useEffect(() => {
        const sigId = getSigId(selectedSig);
        const existingData = JSON.parse(localStorage.getItem("tempEditorData")) || {};
        const updatedData = {
            ...existingData,
            [sigId]: { name: userName, surname: userSubtitle }
        };
        localStorage.setItem("tempEditorData", JSON.stringify(updatedData));
    }, [userName, userSubtitle, selectedSig]);

// PostSelection.jsx
const handleSocialShare = (platform) => {
        if (currentPlan === "free" && platform !== "whatsapp") {
            alert("In the free plan, only WhatsApp sharing is available. Please upgrade to access other platforms!");
            navigate("/subscription");
            return;
        }
     sharePost(postRef, customMessage, platform);
    };
    const handleSaveImage = () => {
        alert("Saved Successfully! ✅");
        setIsEditingInfo(false);
    };

    return (
        <div className="selection-container">
            <Navbar />
            <div className="breadcrumb-nav">
                <img 
                    src={backArrow} 
                    alt="back" 
                    className="back-btn-img" 
                    onClick={() => isEditingInfo ? setIsEditingInfo(false) : navigate(-1)} 
                />
                <span className="breadcrumb-text">
                    {isEditingInfo ? "Signature" : `${categoryName} > ${subCategory || ""}`}
                </span>
            </div>

            <div className="main-content-wrapper">
                <div className={`preview-section ${isEditingInfo ? 'edit-mode-active' : ''}`}>
                
                    <div className={`preview-card sig-mode-${getSigId(selectedSig)}`} ref={postRef}>
                        <img src={postImg} alt="main" className="main-post-img" />
                        {/* --- Watermark for Free Plan --- */}
                      {/* --- Watermark only for Free Plan --- */}
                        {currentPlan === "free" && (
                            <div className="preview-watermark">Created by [App Name]</div>
                        )}

                        {selectedSig && (
                            <img src={selectedSig} alt="sig" className="sig-overlay-img" />
                        )}
                        {selectedSig && (
                            <img src={selectedSig} alt="sig" className="sig-overlay-img" />
                        )} 

                     
                        {allowedProfileSigs.includes(selectedSig) && (
                            <div className="profile-wrapper clickable-profile" onClick={() => navigate("/profile")} style={{ cursor: 'pointer' }}>
                                <div className="profile-ring">
                                    <img src={userPhoto} alt="user" className="user-avatar" />
                                </div>
                            </div>
                        )}

                        <div className="badge-text-area">
                            <h4 className="badge-name">{userName}</h4>
                            <p className="badge-subtitle">{userSubtitle}</p>
                        </div>
                    </div>
                </div>

                {!isEditingInfo && (
                    <div className="side-signature-panel">
                        {personalSigns.slice(0, 3).map((sig, index) => (
                            <div key={index} className={`sig-thumb-option ${selectedSig === sig ? "active" : ""}`} onClick={() => setSelectedSig(sig)}>
                                <img src={postImg} alt="bg" className="thumb-bg" />
                                <img src={sig} alt="overlay" className="thumb-sig-overlay" />
                                <div className="thumb-edit-badge" onClick={(e) => { e.stopPropagation(); setIsEditingInfo(true); }}>
                                    <img src={editIcon} alt="edit" />
                                </div>
                            </div>
                        ))}
                     
                    </div>
                )}
            </div>

            {isEditingInfo ? (
                <div className="full-edit-panel">
                    <div className="input-group-v2">
                        <input type="text" className="styled-input-v2" placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                        <input type="text" className="styled-input-v2" placeholder="Subtitle" value={userSubtitle} onChange={(e) => setUserSubtitle(e.target.value)} />
                    </div>

                    <div className="tab-selection-v2">
                        <button className={`tab-btn-v2 ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>Personal Signs</button>
                     <button 
                            className={`tab-btn-v2 ${activeTab === 'political' ? 'active' : ''} ${currentPlan === 'free' ? 'locked' : ''}`} 
                            onClick={() => currentPlan === 'free' ? navigate("/subscription") : setActiveTab('political')}
                        >
                            Political {currentPlan === 'free' && "🔒"}
                        </button>
                                </div>

                  
                   {activeTab === 'political' && currentPlan !== 'free' && (
                        <>
                            <div className="party-row-v2">
                                <span>Party : </span>
                                <select className="party-select-v2" value={selectedParty} onChange={(e) => setSelectedParty(e.target.value)}>
                                    {Object.keys(partyTemplates).map(party => (
                                        <option key={party} value={party} style={{color:'black'}}>{party}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="horizontal-sig-scroll">
                              {(activeTab === 'personal' ? availablePersonalSigns : partyTemplates[selectedParty]).map((sig, index) => (
                                    <div key={index} className={`mini-sig-preview ${selectedSig === sig ? 'selected' : ''}`} onClick={() => setSelectedSig(sig)}>
                                        <img src={postImg} alt="bg" />
                                        <img src={sig} className="sig-layer" alt="sig" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'personal' && (
                        <div className="horizontal-sig-scroll">
                            {availablePersonalSigns.map((sig, index) => (
                                <div key={index} className={`mini-sig-preview ${selectedSig === sig ? 'selected' : ''}`} onClick={() => setSelectedSig(sig)}>
                                    <img src={postImg} alt="bg" />
                                    <img src={sig} className="sig-layer" alt="sig" />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="action-buttons-container">
                        <button className="download-btn-v3" onClick={handleSaveImage}>Save to signature</button>
                    </div>
                    <button className="done-btn-v2" onClick={() => setIsEditingInfo(false)}>Back</button>
                </div>
            ) : (
                <div className="editor-controls">
                    <textarea 
                        placeholder="Write text message..." 
                        className="styled-textarea"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                    />
             <div className="share-grid">
    {/* WhatsApp */}
    <div className="share-card whatsapp"
onClick={() => sharePost(postRef, customMessage, "whatsapp")}>
        <div className="social-icon"><img src={whatsappIcon} alt="W" /></div>
        <button className="inner-share-btn">Share <span>▷</span></button>
    </div>

    {/* Instagram */}
    <div className="share-card instagram" onClick={() => handleSocialShare("instagram")}>
        <div className="social-icon"><img src={instagramIcon} alt="I" /></div>
        <button className="inner-share-btn">Share <span>▷</span></button>
    </div>

    {/* Facebook */}
    <div className="share-card facebook" onClick={() => handleSocialShare("facebook")}>
        <div className="social-icon"><img src={facebookIcon} alt="F" /></div>
        <button className="inner-share-btn">Share <span>▷</span></button>
    </div>
</div>
                </div>
            )}
        </div>
    );
}