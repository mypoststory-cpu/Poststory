import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import "../styles/PostSelection.css";
import Navbar from "../Navbar";
import editIcon from '../../assets/edit.png';
import defaultUserPhoto from "../../assets/profile.jpg";
import backArrow from "../../assets/lefta.png";
import { sharePost, shareVideo } from "./shareService";
import { db } from "../../firebaseConfig";
import useVideoProcessor from "../VideoProcessor";
import staticLogoImage from "../../assets/newlogo.png";
import { canAccessFeature } from '../../components/pages/subscriptionUtils';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment 
} from "firebase/firestore";

const STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/allezpoststory.firebasestorage.app/o/signatures%2F";
const URL_SUFFIX = "?alt=media";

const getCloudUrl = (filename) => {
    return `${STORAGE_BASE_URL}${encodeURIComponent(filename)}${URL_SUFFIX}`;
};

const sig1 = getCloudUrl("PostStory Personal-01.png");
const sig2 = getCloudUrl("PostStory Personal-02.png");
const sig3 = getCloudUrl("PostStory Personal-03.png");
const sig4 = getCloudUrl("PostStory Personal-04.png");
const sig5 = getCloudUrl("PostStory Personal-05.png");
const sig6 = getCloudUrl("PostStory Personal-06.png");

import whatsappIcon from "../../assets/w.png";
import instagramIcon from "../../assets/i.png";
import facebookIcon from "../../assets/f.png";

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
    const videoPlayerRef = useRef(null);
    const [userPlan, setUserPlan] = useState("pro");
    const [isTrialActive, setIsTrialActive] = useState(true);
    const [activeTool, setActiveTool] = useState('all');

    // Extract location state parameters safely with fallbacks[cite: 3]
    const { postImg, categoryName, subCategory, initialCustomText } = location.state || {};
    const savedProfile = JSON.parse(localStorage.getItem("userData")) || {};

    const [selectedSig, setSelectedSig] = useState(sig1);
    const [userName, setUserName] = useState(() => getInitialValue('name'));
    const [userSubtitle, setUserSubtitle] = useState(() => getInitialValue('surname'));
    const [userPhoto] = useState(savedProfile.profileImage || defaultUserPhoto);
    const [userSignature, setUserSignature] = useState(savedProfile.signatureUrl || savedProfile.signatureImage || null);
    
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    
    // Advanced Canvas & AI Image Editing States[cite: 3]
    const [isAdvancedEditing, setIsAdvancedEditing] = useState(false);
    const [imageFilter, setImageFilter] = useState("none");
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [blur, setBlur] = useState(0);
    
    // Text Customization States (Auto-loads AI text reliably)[cite: 3]
    const [canvasOverlayText, setCanvasOverlayText] = useState(() => {
        return initialCustomText || location.state?.initialCustomText || localStorage.getItem("lastGeneratedAiText") || "";
    });
    const [canvasTextColor, setCanvasTextColor] = useState("#ffffff");
    const [textSize, setTextSize] = useState(20); 
    const [textPosY, setTextPosY] = useState(90); 

    const [selectedSticker, setSelectedSticker] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    const [customMessage, setCustomMessage] = useState("");
    const [activeTab, setActiveTab] = useState("personal");
    const [selectedParty, setSelectedParty] = useState("BJP");
    const [isSharing, setIsSharing] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const { burnSignatureToVideo, isProcessing: isVideoProcessing, progress } = useVideoProcessor();
    const personalSigns = [sig1, sig2, sig3, sig4, sig5, sig6];
    
    const partyTemplates = {
        "BJP": [getCloudUrl("bjp.png"), getCloudUrl("bjp 2.png"), getCloudUrl("bjp 3.png")],
        "SHINDE": [getCloudUrl("shiv.png"), getCloudUrl("shiv 2.png"), getCloudUrl("shiv 3.png")],
        "AJIT": [getCloudUrl("congress Ajit.png"), getCloudUrl("congress Ajit 2.png"), getCloudUrl("congress Ajit 3.png")],
        "UBT": [getCloudUrl("shiv udhav.png"), getCloudUrl("shiv udhav 2.png"), getCloudUrl("shiv udhav 3.png")],
        "INC": [getCloudUrl("congress.png"), getCloudUrl("congress 2.png"), getCloudUrl("congress 3.png")],
        "SHARAD": [getCloudUrl("sharad.png"), getCloudUrl("sharad 2.png"), getCloudUrl("sharad 3.png")],
        "MNS": [getCloudUrl("mns 1.png"), getCloudUrl("mns 2.png"), getCloudUrl("mns 3.png")],
        "VBA": [getCloudUrl("vba 1.png"), getCloudUrl("vba 2.png"), getCloudUrl("vba 3.png")],
        "BVA": [getCloudUrl("bva 1.png"), getCloudUrl("bva 2.png"), getCloudUrl("bva 3.png")],
        "PWP": [getCloudUrl("pwp.png"), getCloudUrl("pwp 2.png"), getCloudUrl("pwp 3.png")],
        "AIMIM": [getCloudUrl("AIMIM 1.png"), getCloudUrl("AIMIM 2.png"), getCloudUrl("AIMIM 3.png")],
        "SP": [getCloudUrl("SP 1.png"), getCloudUrl("SP 2.png"), getCloudUrl("SP 3.png")],
        "RPI": [getCloudUrl("RPI 1.png"), getCloudUrl("RPI 2.png"), getCloudUrl("RPI 3.png")],
        "PRAHAR": [getCloudUrl("PRAHAR 1.png"), getCloudUrl("PRAHAR 2.png"), getCloudUrl("PRAHAR 3.png")],
        "RSP": [getCloudUrl("RSP 1.png"), getCloudUrl("rps.png"), getCloudUrl("RSP 3.png")]
    };

    const allowedProfileSigs = [
        sig2, 
        partyTemplates["BJP"][0], partyTemplates["BJP"][2],
        partyTemplates["SHINDE"][0], partyTemplates["SHINDE"][2],
        partyTemplates["AJIT"][0], partyTemplates["AJIT"][2],
        partyTemplates["UBT"][0], partyTemplates["UBT"][2],
        partyTemplates["INC"][0], partyTemplates["INC"][2],
        partyTemplates["SHARAD"][0], partyTemplates["SHARAD"][2],
        partyTemplates["MNS"][0], partyTemplates["MNS"][2],
        partyTemplates["VBA"][0], partyTemplates["VBA"][2],
        partyTemplates["BVA"][0], partyTemplates["BVA"][2],
        partyTemplates["PWP"][0], partyTemplates["PWP"][2],
        partyTemplates["AIMIM"][0], partyTemplates["AIMIM"][2],
        partyTemplates["SP"][0], partyTemplates["SP"][2],
        partyTemplates["RPI"][0], partyTemplates["RPI"][2],
        partyTemplates["PRAHAR"][0], partyTemplates["PRAHAR"][2],
        partyTemplates["RSP"][0], partyTemplates["RSP"][2]
    ];

    const allowedSignatureSigs = [
        sig1, sig2, sig3, sig4, sig5, sig6,
        partyTemplates["BJP"][0], partyTemplates["BJP"][1], partyTemplates["BJP"][2],
        partyTemplates["SHINDE"][0], partyTemplates["SHINDE"][1], partyTemplates["SHINDE"][2],
        partyTemplates["AJIT"][0], partyTemplates["AJIT"][1], partyTemplates["AJIT"][2],
        partyTemplates["UBT"][0], partyTemplates["UBT"][1], partyTemplates["UBT"][2],
        partyTemplates["INC"][0], partyTemplates["INC"][1], partyTemplates["INC"][2],
        partyTemplates["SHARAD"][0], partyTemplates["SHARAD"][1], partyTemplates["SHARAD"][2],
        partyTemplates["MNS"][0], partyTemplates["MNS"][1], partyTemplates["MNS"][2]
    ];

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

    const getImageStyles = () => {
        let filterStr = "";
        if (imageFilter === "grayscale") filterStr += "grayscale(100%) ";
        if (imageFilter === "sepia") filterStr += "sepia(100%) ";
        if (imageFilter === "invert") filterStr += "invert(100%) ";
        if (imageFilter === "vivid") filterStr += "saturate(180%) contrast(120%) ";
        filterStr += `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
        return {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            filter: filterStr
        };
    };

    const handleAiStyleEnhance = () => {
        if (!aiPrompt) {
            alert("Please enter an AI style instruction or select a quick option.");
            return;
        }
        setIsAiProcessing(true);
        setTimeout(() => {
            if (aiPrompt.toLowerCase().includes("vivid") || aiPrompt.toLowerCase().includes("bright")) {
                setBrightness(120);
                setContrast(115);
                setSaturation(150);
            } else if (aiPrompt.toLowerCase().includes("cinematic") || aiPrompt.toLowerCase().includes("dark")) {
                setBrightness(90);
                setContrast(130);
                setImageFilter("none");
            } else {
                setBrightness(105);
                setSaturation(125);
            }
            setIsAiProcessing(false);
            alert("✨ AI Enhancement applied successfully!");
        }, 1000);
    };
   
    useEffect(() => {
        const fetchPostDescription = async () => {
            if (!postImg) return;
            try {
                const postCollectionRef = collection(db, "postimg");
                const querySnapshot = await getDocs(postCollectionRef);
                const currentPost = querySnapshot.docs.find(doc => doc.data().imageUrl === postImg);
                if (currentPost) {
                    const postData = currentPost.data();
                    setCustomMessage(`${postData.title || ""}\n${postData.description || ""}`);
                }
            } catch (error) {
                console.error("Error fetching description:", error);
            }
        };
        fetchPostDescription();
    }, [postImg]);

    useEffect(() => {
        const verifySubscriptionAndTrial = async () => {
            const savedUser = JSON.parse(localStorage.getItem("userData"));
            if (!savedUser?.mobile) return;
            try {
                const userRef = doc(db, "users", savedUser.mobile);
                const userSnap = await getDoc(userRef);
                let trialEndDate = new Date();
                trialEndDate.setDate(trialEndDate.getDate() + 45);
                let dbStatus = "pro"; 
                let dbPlanExpiry = null;

                if (userSnap.exists()) {
                    const currentUserData = userSnap.data();
                    dbStatus = currentUserData.subscriptionStatus || "pro";
                    dbPlanExpiry = currentUserData.planExpiryDate;
                    if (currentUserData.signatureUrl || currentUserData.signatureImage) {
                        setUserSignature(currentUserData.signatureUrl || currentUserData.signatureImage);
                    }
                    if (currentUserData.createdAt) {
                        const createdTime = currentUserData.createdAt.seconds 
                          ? new Date(currentUserData.createdAt.seconds * 1000) 
                          : new Date(currentUserData.createdAt);
                        const expiryCalc = new Date(createdTime);
                        expiryCalc.setDate(expiryCalc.getDate() + 45);
                        trialEndDate = expiryCalc;
                    }
                }

                const q = query(collection(db, "subscriptions"), where("mobile", "==", savedUser.mobile), orderBy("timestamp", "desc"));
                const querySnapshot = await getDocs(q);
                const historyData = querySnapshot.docs.map(doc => doc.data());
                const now = new Date();
                let activePlan = "pro";

                if (historyData.length > 0) {
                    const expiryDateObj = new Date(dbPlanExpiry || historyData[0].expiryDate);
                    activePlan = expiryDateObj > now ? "pro" : "free";
                } else if (now > trialEndDate) {
                    activePlan = "free";
                    if (dbStatus !== "free") {
                        await updateDoc(userRef, { subscriptionStatus: "free", currentPlan: "free" });
                    }
                }

                setUserPlan(activePlan);
                setIsTrialActive(now <= trialEndDate);

            } catch (error) {
                console.error("Error fetching subscription status:", error);
                setUserPlan("free"); 
                setIsTrialActive(false);
            }
        };
        verifySubscriptionAndTrial();
    }, []);

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

    const logShareHistory = async (platform) => {
        const savedUser = JSON.parse(localStorage.getItem("userData"));
        if (!savedUser?.mobile) return;
        try {
            const userRef = doc(db, "users", savedUser.mobile);
            await updateDoc(userRef, { postCount: increment(1) });
            await addDoc(collection(db, "user_history"), {
                mobile: savedUser.mobile,
                platform: platform,
                img: postImg || "",
                category: categoryName || "Daily Post",
                date: new Date().toLocaleDateString(),
                timestamp: serverTimestamp()
            });
        } catch (fbErr) {
            console.error("❌ Firebase log error:", fbErr);
        }
    };

    const handleDirectAppShare = async (platform) => {
        const savedUser = JSON.parse(localStorage.getItem("userData"));
        if (!savedUser?.mobile) {
            alert("Please complete your profile first!");
            return;
        }
        const isSocialRestricted = (platform === "instagram" || platform === "facebook") && !canAccessFeature(userPlan, 'socialMediaPlatforms');
        const isVideo = postImg && (postImg.toLowerCase().includes(".mp4") || postImg.toLowerCase().includes(".mov") || postImg.includes("video"));
        const isVideoRestricted = isVideo && !canAccessFeature(userPlan, 'videoLibrary');

        if (isSocialRestricted || isVideoRestricted) {
            alert("Upgrade to Pro to unlock this feature!");
            navigate("/subscription");
            return;
        }
        
        if ((platform === "instagram" || platform === "facebook") && customMessage) {
            try {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(customMessage);
                }
            } catch (clipErr) {
                console.error("Clipboard copy failed:", clipErr);
            }
        }

        setIsSharing(true);
        try {
            if (userPlan === "free") {
                const userRef = doc(db, "users", savedUser.mobile);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists() && userSnap.data().postCount >= 60) {
                    alert("Free limit reached. Subscribe to continue sharing.");
                    navigate("/subscription");
                    return;
                }
            }

            await logShareHistory(platform);

            if (isVideo) {
                if (videoPlayerRef.current) videoPlayerRef.current.currentTime = 0;
                const processedVideoUrl = await burnSignatureToVideo(
                    videoPlayerRef, 
                    selectedSig, 
                    userPhoto || defaultUserPhoto,
                    { name: userName, subtitle: userSubtitle, userSignature: userSignature },
                    getSigId(selectedSig) 
                );

                if (!processedVideoUrl) {
                    alert("Could not process video asset.");
                    return;
                }

                if (platform === "instagram" || platform === "facebook") {
                     alert("📝 The caption has been copied! Once the app opens, just paste it there.");
                }
                await shareVideo(customMessage, platform, processedVideoUrl);
            } else {
                if (platform === "instagram" || platform === "facebook") {
                    alert("📝 The caption has been copied! Once the app opens, just paste it there.");
                }
                await sharePost(postRef, customMessage, platform, postImg);
            }
        } catch (error) {
            console.error("Sharing failed:", error);
            alert("Sharing failed. Please try again.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleSaveImage = () => {
        alert("Saved Successfully! ✅");
        setIsEditingInfo(false);
        setIsAdvancedEditing(false);
    };

    const isMediaVideo = postImg && (
        postImg.toLowerCase().includes(".mp4") || 
        postImg.toLowerCase().includes(".mov") || 
        postImg.includes("video")
    );

    const currentSigId = getSigId(selectedSig);
return (
        <div className="selection-container">
          <style>{`
            .user-signature-overlay-container {
                position: absolute !important;
                bottom: 22px !important;
                right: 25px !important;
                z-index: 100 !important;
                pointer-events: none !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .user-actual-signature-img {
                max-height: 45px !important;
                max-width: 110px !important;
                object-fit: contain !important;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
            }
            .advanced-edit-toggle-btn {
                background: #ca8b37;
                color: #000;
                border: none;
                padding: 6px 14px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 13px;
            }
          `}</style>

          {(isSharing || isVideoProcessing || isAiProcessing) && (
            <div className="sharing-loader-overlay">
              <div className="loader-content">
                <p>{isAiProcessing ? "✨ AI is enhancing your image styles..." : isVideoProcessing ? `Processing HD Quality... ${progress}%` : "Preparing your post... Please wait"}</p>
              </div>
            </div>
          )}
          
          <Navbar />
          
          <div className="breadcrumb-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={backArrow}
                alt="back"
                className="back-btn-img"
                onClick={() => (isEditingInfo || isAdvancedEditing ? (setIsEditingInfo(false), setIsAdvancedEditing(false)) : navigate(-1))}
              />
              <span className="breadcrumb-text">
                {isEditingInfo ? "Signature" : isAdvancedEditing ? "Edit" : `${categoryName} > ${subCategory || ""}`}
              </span>
            </div>
            {!isEditingInfo && !isMediaVideo && (
              <button 
                className="advanced-edit-toggle-btn"
                onClick={() => setIsAdvancedEditing(!isAdvancedEditing)}
              >
                {isAdvancedEditing ? "Done Editing" : "Edit"}
              </button>
            )}
          </div>

          <div className="main-content-wrapper">
            <div className={`preview-section ${isEditingInfo ? 'edit-mode-active' : ''}`}>
               <div className={`preview-card sig-mode-${currentSigId}`} ref={postRef} style={{ position: "relative", overflow: "hidden" }}>
                 
                 {isMediaVideo ? (
                   <video
                     ref={videoPlayerRef}
                     src={postImg}
                     className="main-post-img"
                     autoPlay
                     muted
                     playsInline
                     crossOrigin="anonymous"
                     style={{ width: "100%", display: "block", borderRadius: "10px", position: "relative", zIndex: 1 }}
                   />
                 ) : (
                   <img
                     src={postImg}
                     alt="main"
                     className="main-post-img"
                     crossOrigin="anonymous"
                     onLoad={() => setImageLoaded(true)}
                     style={getImageStyles()}
                   />
                 )}

                 {selectedSticker && (
                   <div style={{ position: "absolute", top: "15px", left: "15px", zIndex: 6, background: "rgba(0,0,0,0.6)", color: "#ca8b37", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", border: "1px solid #ca8b37" }}>
                     {selectedSticker}
                   </div>
                 )}
           {/* Fakt jevha 'Edit' button var click hoil ani isAdvancedEditing true asel, tarach toolbar disel */}
{isAdvancedEditing && (
  <div className="ig-bottom-toolbar">
      <button className="ig-bottom-btn" onClick={() => setActiveTool('text')}>
        <span className="ig-b-icon">Aa</span>
        <span className="ig-b-label">Text</span>
      </button>
      <button className="ig-bottom-btn" onClick={() => setActiveTool('restyle')}>
        <span className="ig-b-icon">✨</span>
        <span className="ig-b-label">Restyle</span>
      </button>
      <button className="ig-bottom-btn" onClick={() => setActiveTool('effects')}>
        <span className="ig-b-icon">🪄</span>
        <span className="ig-b-label">Effects</span>
      </button>

  
  </div>
)}
                 {canvasOverlayText && (
                   <div style={{ 
                       position: "absolute", 
                       bottom: `${textPosY}px`, 
                       left: "0",
                       right: "0",
                       margin: "0 auto",
                       width: "90%", 
                       textAlign: "center", 
                       color: canvasTextColor, 
                       fontSize: `${textSize}px`, 
                       fontWeight: "bold", 
                       lineHeight: "1.2",
                       wordBreak: "break-word",
                       overflowWrap: "break-word",
                       textShadow: "2px 2px 4px rgba(0,0,0,0.8)", 
                       zIndex: 6, 
                       boxSizing: "border-box" 
                   }}>
                     {canvasOverlayText}
                   </div>
                 )}
                 {userPlan === "free" && (
                   <div className="watermark-top-right" style={{ zIndex: 10, position: "absolute", top: 10, right: 10 }}>
                     <img src={staticLogoImage} alt="Logo" className="watermark-icon" />
                   </div>
                 )}

                 {selectedSig && (
                   <img 
                       src={selectedSig} 
                       alt="sig" 
                       className="sig-overlay-img" 
                       style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5, pointerEvents: "none" }} 
                   />
                 )}

                 {((currentSigId === "sig2") || (allowedProfileSigs.includes(selectedSig) && !currentSigId.startsWith("sig"))) && (
                   <div className="profile-wrapper clickable-profile" onClick={() => navigate("/profile")} style={{ zIndex: 7 }}>
                     <div className="profile-ring">
                       <img src={userPhoto} alt="user" className="user-avatar" crossOrigin="anonymous" />
                     </div>
                   </div>
                 )}

                 <div className="badge-text-area" style={{ zIndex: 6 }}>
                   <h4 className="badge-name">{userName}</h4>
                   <p className="badge-subtitle">{userSubtitle}</p>
                 </div>

                 {userSignature && allowedSignatureSigs.includes(selectedSig) && (
                   <div className="user-signature-overlay-container">
                       <img src={userSignature} alt="User Signature" crossOrigin="anonymous" className="user-actual-signature-img" />
                   </div>
                 )}
               </div>
            </div>

            {!isEditingInfo && !isAdvancedEditing && (
              <div className="side-signature-panel">
                {personalSigns.slice(0, 3).map((sig, index) => (
                  <div
                    key={index}
                    className={`sig-thumb-option ${selectedSig === sig ? "active" : ""}`}
                    onClick={() => setSelectedSig(sig)}
                  >
                    {isMediaVideo ? (
                       <video src={postImg} className="thumb-bg" muted playsInline />
                    ) : (
                       <img src={postImg} alt="bg" className="thumb-bg" crossOrigin="anonymous" />
                    )}
                    <img src={sig} alt="overlay" crossOrigin="anonymous" className="thumb-sig-overlay" />
                    <div className="thumb-edit-badge" onClick={(e) => { e.stopPropagation(); setIsEditingInfo(true); }}>
                      <img src={editIcon} alt="edit" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced AI & Canvas Editing Panel */}
      {isAdvancedEditing ? (
  <div style={{ 
      background: 'rgba(24, 24, 28, 0.95)', 
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '20px', 
      borderRadius: '20px', 
      marginTop: '15px', 
      maxHeight: '75vh', 
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      <h4 style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {activeTool === 'text' ? '✍️ Text Studio' : activeTool === 'restyle' ? '✨ AI Restyle & Filters' : activeTool === 'effects' ? '🪄 Image Effects' : '✨ Story Studio Editor'}
      </h4>
      <button 
        onClick={() => { setIsAdvancedEditing(false); setActiveTool('all'); }}
        style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '18px', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
    
    {/* AI Style Prompt & Filters - Fakt 'all' kinva 'restyle' asel tarach disel */}
    {(activeTool === 'all' || activeTool === 'restyle') && (
      <>
      

 
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Image Filters</label>
          
          {/* Filter options with mini image preview */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'none', label: 'Normal', filter: 'none' },
              { id: 'grayscale', label: 'B&W', filter: 'grayscale(100%)' },
              { id: 'sepia', label: 'Vintage', filter: 'sepia(100%)' },
              { id: 'vivid', label: 'Vivid', filter: 'contrast(130%) saturate(150%)' },
              { id: 'cool', label: 'Cool', filter: 'hue-rotate(180deg) saturate(120%)' },
              { id: 'warm', label: 'Warm', filter: 'sepia(50%) saturate(140%)' },
              { id: 'invert', label: 'Invert', filter: 'invert(100%)' },
              { id: 'brightness', label: 'Bright', filter: 'brightness(130%)' }
            ].map((f) => (
              <div
                key={f.id}
                onClick={() => setImageFilter(f.id)}
                style={{
                  flex: '0 0 55px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                {/* Thumbnail image showing the actual filter preview */}
                <div style={{
                  width: '55px',
                  height: '55px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: imageFilter === f.id ? '2px solid #ca8b37' : '2px solid rgba(255,255,255,0.2)',
                  boxShadow: imageFilter === f.id ? '0 0 8px rgba(202,139,55,0.6)' : 'none',
                  marginBottom: '4px',
                  background: '#000'
                }}>
                  <img 
                    src={postImg} 
                    alt={f.label} 
                    crossOrigin="anonymous"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: f.filter
                    }}
                  />
                </div>
                <span style={{
                  fontSize: '9px',
                  color: imageFilter === f.id ? '#ca8b37' : '#aaa',
                  fontWeight: imageFilter === f.id ? 'bold' : 'normal',
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    )}

    {/* Sliders for Effects - Fakt 'all' kinva 'effects' asel tarach disel */}
    {(activeTool === 'all' || activeTool === 'effects') && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '14px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Brightness ({brightness}%)</label>
          <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(e.target.value)} style={{ width: '100%', accentColor: '#ca8b37' }} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Contrast ({contrast}%)</label>
          <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(e.target.value)} style={{ width: '100%', accentColor: '#ca8b37' }} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Saturation ({saturation}%)</label>
          <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(e.target.value)} style={{ width: '100%', accentColor: '#ca8b37' }} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Blur ({blur}px)</label>
          <input type="range" min="0" max="10" value={blur} onChange={(e) => setBlur(e.target.value)} style={{ width: '100%', accentColor: '#ca8b37' }} />
        </div>
      </div>
    )}

    {/* Text Overlay Customization - Fakt 'all' kinva 'text' asel tarach disel */}
    {(activeTool === 'all' || activeTool === 'text') && (
      <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <label style={{ fontSize: '12px', color: '#ca8b37', display: 'block', marginBottom: '10px', fontWeight: '600' }}>Text Tool (Instagram Style)</label>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input 
            type="text" 
            placeholder="Edit text content..." 
            value={canvasOverlayText} 
            onChange={(e) => setCanvasOverlayText(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', outline: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0 8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <input 
              type="color" 
              value={canvasTextColor} 
              onChange={(e) => setCanvasTextColor(e.target.value)}
              style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer' }}
              title="Choose Text Color"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Font Size ({textSize}px)</label>
            <input type="range" min="14" max="64" value={textSize} onChange={(e) => setTextSize(e.target.value)} style={{ width: '100%', accentColor: '#ca8b37' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Position Y ({textPosY}px)</label>
            <input type="range" min="20" max="500" value={textPosY} onChange={(e) => setTextPosY(e.target.value)} style={{ width: '100%', accentColor: '#ca8b37' }} />
          </div>
        </div>
      </div>
    )}

    <button 
      className="done-btn-v2" 
      onClick={() => { setIsAdvancedEditing(false); setActiveTool('all'); }}
      style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#ca8b37', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px' }}
    >
      Done
    </button>
  </div>

          ) : isEditingInfo ? (
            <div className="full-edit-panel">
              <div className="input-group-v2">
                <input type="text" className="styled-input-v2" placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                <input type="text" className="styled-input-v2" placeholder="Subtitle" value={userSubtitle} onChange={(e) => setUserSubtitle(e.target.value)} />
              </div>

              <div className="tab-selection-v2">
                <button className={`tab-btn-v2 ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                  Personal Signs
                </button>
                <button className={`tab-btn-v2 ${activeTab === 'political' ? 'active' : ''}`} onClick={() => setActiveTab('political')}>
                  Political {userPlan === 'free' && "🔒"}
                </button>
              </div>

              {activeTab === 'political' && (
                <>
                    <div className="party-row-v2">
                        <span>Party : </span>
                        <select className="party-select-v2" value={selectedParty} onChange={(e) => setSelectedParty(e.target.value)}>
                            {Object.keys(partyTemplates).map(party => (
                                <option key={party} value={party} style={{ color: 'black' }}>{party}</option>
                            ))}
                        </select>
                    </div>

                    <div className="horizontal-sig-scroll">
                        {partyTemplates[selectedParty].map((sig, index) => {
                          const isLocked = userPlan === 'free' && !isTrialActive && !canAccessFeature(userPlan, 'politicalKits');
                          return (
                            <div 
                              key={index} 
                              className={`mini-sig-preview ${selectedSig === sig ? 'selected' : ''} ${isLocked ? 'locked' : ''}`} 
                              onClick={() => isLocked ? navigate("/subscription") : setSelectedSig(sig)}
                            >
                                {isMediaVideo ? (
                                    <video src={postImg} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <img src={postImg} alt="bg" crossOrigin="anonymous" />
                                )}
                                <img src={sig} className="sig-layer" crossOrigin="anonymous" alt="sig" />
                                {isLocked && <div className="mini-lock"><span>🔒</span></div>}
                            </div>
                          );
                        })}
                    </div>
                </>
              )}

              {activeTab === 'personal' && (
                <div className="horizontal-sig-scroll">
                  {personalSigns.map((sig, index) => {
                    const isLocked = !canAccessFeature(userPlan, 'allSignatures') && index > 2;
                    return (
                      <div
                        key={index}
                        className={`mini-sig-preview ${selectedSig === sig ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                        onClick={() => (isLocked ? navigate("/subscription") : setSelectedSig(sig))}
                      >
                        {isMediaVideo ? (
                          <video src={postImg} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <img src={postImg} alt="bg" crossOrigin="anonymous" />
                        )}
                        <img src={sig} className="sig-layer" crossOrigin="anonymous" alt="sig" />
                        {isLocked && <div className="mini-lock"><span>🔒</span></div>}
                      </div>
                    );
                  })}
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
                <div className="share-card whatsapp" onClick={() => handleDirectAppShare("whatsapp")}>
                  <div className="social-icon"><img src={whatsappIcon} alt="W" /></div>
                  <button className="inner-share-btn">Share <span>▷</span></button>
                </div>
                <div className="share-card instagram" onClick={() => handleDirectAppShare("instagram")}>
                  <div className="social-icon"><img src={instagramIcon} alt="I" /></div>
                  <button className="inner-share-btn">Share <span>▷</span></button>
                </div>
                <div className="share-card facebook" onClick={() => handleDirectAppShare("facebook")}>
                  <div className="social-icon"><img src={facebookIcon} alt="F" /></div>
                  <button className="inner-share-btn">Share <span>▷</span></button>
                </div>
              </div>
            </div>
          )}
        </div>
    );
}