import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Foru.css";
import Navbar from "../Navbar";

// --- Firestore & Auth Imports ---
import { 
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, 
  collection, query, where, getDocs, increment 
} from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

import backArrow from "../../assets/lefta.png";
import menuIcon from "../../assets/menu.png"; // NEW: Filter menu icon import
import vectorIcon from '../../assets/Vector1.png'; 
import filledHeartIcon from '../../assets/herat.png';
import next from "../../assets/next.png"; 

// फायरबेस टोकन आणि क्वेरी पॅरामीटर्स असले तरी फाईल फॉरमॅट ओळखणारे सुरक्षित हेल्पर फंक्शन
const isVideo = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm');
};

export default function ForuPage() {
  const navigate = useNavigate();
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all_media"); // NEW: Media Filter State
  const [showFilter, setShowFilter] = useState(false); // NEW: Dropdown toggle state
  const [selectedFullImage, setSelectedFullImage] = useState(null);
  
  const [favorites, setFavorites] = useState([]);
  const [userMobile, setUserMobile] = useState(null); 

  // 1. Fetch User Data and Favorites
  useEffect(() => {
    const fetchInitialData = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.mobile) {
        setUserMobile(userData.mobile);
        try {
          const userRef = doc(db, "users", userData.mobile);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setFavorites(docSnap.data().favImages || []);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };
    fetchInitialData();
  }, []);

  // 2. Load Local Recently Viewed
  useEffect(() => {
    setLoading(true);
    const data = localStorage.getItem("recently_viewed");
    if (data) {
      setRecentImages(JSON.parse(data));
    }
    setLoading(false);
  }, []);
  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showFilter) {
        setShowFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showFilter]);

  // 3. Toggle Favorite
  const toggleFavorite = async (e, imgSrc) => {
    e.stopPropagation();
    if (!userMobile) {
      alert("Please login to save favorites!");
      return;
    }

    const userRef = doc(db, "users", userMobile);
    const isAlreadyFav = favorites.includes(imgSrc);

    try {
      if (isAlreadyFav) {
        setFavorites(prev => prev.filter(fav => fav !== imgSrc));
        await updateDoc(userRef, { favImages: arrayRemove(imgSrc) });
      } else {
        setFavorites(prev => [...prev, imgSrc]);
        await setDoc(userRef, { favImages: arrayUnion(imgSrc) }, { merge: true });
      }
    } catch (error) {
      console.error("Favorite update error:", error);
    }
  };

  // 4. Handle Preview and Click Increment (for Trending logic)
  const handleImagePreview = async (imgUrl) => {
    setSelectedFullImage(imgUrl);

    const updatedRecent = [imgUrl, ...recentImages.filter(img => img !== imgUrl)];
    localStorage.setItem("recently_viewed", JSON.stringify(updatedRecent.slice(0, 20)));
    setRecentImages(updatedRecent);

    // Increment clickCount so it can show up on Trending page
    try {
      const q = query(collection(db, "postimg"), where("imageUrl", "==", imgUrl));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const postRef = doc(db, "postimg", docId);
        await updateDoc(postRef, {
          clickCount: increment(1) 
        });
      }
    } catch (error) {
      console.error("Error updating click count:", error);
    }
  };

  const navigateImage = (direction) => {
    const currentIndex = filteredRecent.indexOf(selectedFullImage); 

    if (direction === "next") {
      const nextIndex = (currentIndex + 1) % filteredRecent.length;
      setSelectedFullImage(filteredRecent[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + filteredRecent.length) % filteredRecent.length;
      setSelectedFullImage(filteredRecent[prevIndex]);
    }
  };

  const handleNextToEdit = () => {
    navigate("/post-selection", { 
      state: { postImg: selectedFullImage, categoryName: "Recently Viewed" } 
    });
  };

  // 5. Filtering Logic (Updated for Search + Media Filter)
  const filteredRecent = recentImages.filter((imgUrl) => {
    const queryTerm = searchQuery.toLowerCase().trim();
    const isPostVideo = isVideo(imgUrl);
    
    // 1. Search Filter
    const matchesSearch = queryTerm === "" || imgUrl.toLowerCase().includes(queryTerm);
    
    // 2. Media Filter
    let matchesMedia = true;
    if (mediaFilter === "images_only") {
      matchesMedia = !isPostVideo;
    } else if (mediaFilter === "videos_only") {
      matchesMedia = isPostVideo;
    }

    return matchesSearch && matchesMedia;
  });

  return (
    <div className="cat-page-container5">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      <div className="cat-banner1"></div>

      <div className="cat-filter-header1" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="left-side1" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={backArrow} alt="back" className="back-icon1" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
          <h3>Recently Viewed</h3>
        </div>

        {/* NEW: Media Type Filter Dropdown UI */}
        <div className="right-side1" style={{ position: 'relative' }}>
          <div className="filter-controls1" onClick={(e) => {
    e.stopPropagation();
    setShowFilter((prev) => !prev);
  }}style={{ cursor: 'pointer' }}>
            <div className="filter-trigger1">
              <img src={menuIcon} alt="filter" className="vector-img-main1" style={{ width: '24px', height: '24px' }} />
            </div>

            {showFilter && (
              <div className="filter-dropdown1 show" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '35px', background: '#222', padding: '10px', borderRadius: '8px', zIndex: 10, minWidth: '150px', border: '1px solid #444' }}>
                <div className="filter-item1" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>Media Type</label>
                  <select value={mediaFilter} onChange={(e) => { setMediaFilter(e.target.value); setShowFilter(false); }} style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>
                    <option value="all_media">All (Images & Videos)</option>
                    <option value="images_only">Only Images</option>
                    <option value="videos_only">Only Videos</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="posts-grid5">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'white' }}>Loading history...</p>
        ) : filteredRecent.length > 0 ? (
          filteredRecent.map((imgUrl, index) => {
            const isFavorite = favorites.includes(imgUrl);
            return (
              <div key={index} className="post-item5" style={{ position: 'relative' }}>
                {isVideo(imgUrl) ? (
                  <video 
                    src={imgUrl} 
                    className="grid-img5"
                    muted
                    playsInline
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer', objectFit: 'cover' }}
                    onClick={() => handleImagePreview(imgUrl)}
                  />
                ) : (
                  <img 
                    src={imgUrl} 
                    alt="Recent Post"
                    className="grid-img5"
                    loading="lazy"
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer' }}
                    onClick={() => handleImagePreview(imgUrl)}
                  />
                )}
                
                {/* Heart / Favorite Overlay Icon in Grid */}
                <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, imgUrl)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', zIndex: 2 }}>
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px', height: '24px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: 'white' }}>
             <p>No posts found for selected filters.</p>
             <button className="explore-btn" onClick={() => navigate("/")} style={{ marginTop: '15px', padding: '10px 20px', background: '#BA7B03', border: 'none', color: 'white', borderRadius: '20px', cursor: 'pointer' }}>Browse Designs</button>
          </div>
        )}
      </main>

      {/* Full Image/Video Modal */}
      {selectedFullImage && (
        <div className="full-image-modal-overlay" onClick={() => setSelectedFullImage(null)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedFullImage(null)}>✕</button>
            <div className="modal-main-layout">
              <div className="modal-nav-arrow left" onClick={() => navigateImage("prev")}>
                <img src={next} alt="prev" />
              </div>
              <div className="modal-image-wrapper">
                {isVideo(selectedFullImage) ? (
                  <video 
                    src={selectedFullImage} 
                    className="full-view-img" 
                    controls 
                    autoPlay 
                    playsInline
                    style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "10px", display: "block" }}
                  />
                ) : (
                  <img src={selectedFullImage} alt="Full View" className="full-view-img" />
                )}
                <div className="modal-fav-icon-overlay" onClick={(e) => toggleFavorite(e, selectedFullImage)}>
                  <img src={favorites.includes(selectedFullImage) ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '30px', height: '30px' }} />
                </div>
              </div>
              <div className="modal-nav-arrow right" onClick={() => navigateImage("next")}>
                <img src={next} alt="next" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
            <div className="modal-footer-action">
              <button className="continue-btn" onClick={handleNextToEdit}>
                Continue <img src={backArrow} alt="next" className="btn-arrow" style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}