import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  where,
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  increment 
} from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

import "../styles/Trending.css";
import Navbar from "../Navbar";

import backArrow from "../../assets/lefta.png";
import menuIcon from "../../assets/menu.png"; 
import vectorIcon from '../../assets/Vector1.png'; 
import filledHeartIcon from '../../assets/herat.png';
import next from "../../assets/next.png";   

const isVideo = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm');
};

export default function TrendingPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang");
  const [selectedFullImage, setSelectedFullImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [userMobile, setUserMobile] = useState(null);

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
          console.error("Error loading user favorites:", err);
        }
      }
    };
    fetchInitialData();
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
  // 2. Fetch Trending Images (Updates Category From Past 30 Days)
  useEffect(() => {
    const fetchTrendingImages = async () => {
      try {
        setLoading(true);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const q = query(
          collection(db, "postimg"),
          where("category", "==", "Updates"),      
          where("createdAt", ">=", thirtyDaysAgo), 
          orderBy("createdAt", "desc"), 
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const trendingList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setImages(trendingList);
      } catch (error) {
        console.error("Trending fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingImages();
  }, []);

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

  const handleImageClick = async (post) => {
    setSelectedFullImage(post); 
    
    if (post.id) {
      try {
        const postRef = doc(db, "postimg", post.id);
        await updateDoc(postRef, {
          clickCount: increment(1)
        });
      } catch (error) {
        console.error("Error updating trending count:", error);
      }
    }
  };

  const navigateImage = (direction) => {
    const currentIndex = filteredPosts.findIndex(post => post.imageUrl === selectedFullImage.imageUrl);
    if (currentIndex === -1) return;

    if (direction === "next") {
      const nextIndex = (currentIndex + 1) % filteredPosts.length; 
      setSelectedFullImage(filteredPosts[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + filteredPosts.length) % filteredPosts.length;
      setSelectedFullImage(filteredPosts[prevIndex]);
    }
  };

  const handleNextToEdit = () => {
    if (!selectedFullImage) return;
    navigate("/post-selection", { 
      state: { 
        postImg: selectedFullImage.imageUrl, 
        categoryName: selectedFullImage.category || "Trending",
        subCategory: selectedFullImage.subCategory || ""
      } 
    });
  };

  const filteredPosts = images.filter((post) => {
    const queryTerm = searchQuery.toLowerCase().trim();
    const postTitle = (post.title || "").toLowerCase();
    const postLang = (post.language || "").toLowerCase();
    const matchesSearch = queryTerm === "" || postTitle.includes(queryTerm);
    const matchesLanguage = selectedLanguage === "all_lang" || postLang === selectedLanguage.toLowerCase().trim();
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="cat-page-container8">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      <div className="cat-banner8"></div>

      <div className="cat-filter-header8">
        <div className="left-side8">
          <img src={backArrow} alt="back" className="back-icon8" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
          <h3>Trending Updates</h3>
        </div>

        <div className="right-side8">
          <div className="filter-controls8"onClick={(e) => {
    e.stopPropagation();
    setShowFilter((prev) => !prev);
  }}>
            <div className="filter-trigger8">
               <img src={menuIcon} alt="filter" className="vector-img-main8" />
            </div>
            <div className={`filter-dropdown8 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              <div className="filter-item8">
                <label>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="all_lang">All Languages</option> 
                  <option value="marathi">Marathi</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="posts-grid8">
        {loading ? (
          <p className="no-images-msg" style={{ textAlign: 'center', gridColumn: '1/-1' }}>Loading viral posts...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isFavorite = favorites.includes(post.imageUrl);
            return (
              <div key={post.id} className="post-item1" style={{ position: 'relative' }}>
                {/* Fixed Image & Video Rendering Logic */}
                {isVideo(post.imageUrl) ? (
                  <video 
                    src={post.imageUrl}
                    className="grid-img8"
                    muted
                    playsInline
                    onClick={() => handleImageClick(post)} 
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: "pointer", objectFit: 'cover'}}
                  />
                ) : (
                  <img 
                    src={post.thumbnailUrl || post.imageUrl}
                    alt={post.title || "Trending Post"} 
                    loading="lazy"
                    className="grid-img8" 
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: "pointer" }}
                    onClick={() => handleImageClick(post)} 
                    onError={(e) => { e.target.src = 'https://placehold.jp/300x300.png'; }}
                  />
                )}

                {/* Fixed Overlay Heart (Favorite) Icon */}
                <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, post.imageUrl)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', zIndex: 2 }}>
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px', height: '24px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-images-msg" style={{ textAlign: 'center', gridColumn: '1/-1' }}>No trending images found.</p>
        )}
      </main>

      {/* Full Size Modal View */}
      {selectedFullImage && (
        <div className="full-image-modal-overlay" onClick={() => setSelectedFullImage(null)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedFullImage(null)}>✕</button>

            <div className="modal-main-layout">
              <div className="modal-nav-arrow left" onClick={() => navigateImage("prev")}>
                <img src={next} alt="prev" />
              </div>

              <div className="modal-image-wrapper">
                {isVideo(selectedFullImage.imageUrl) ? (
                  <video 
                    src={selectedFullImage.imageUrl} 
                    className="full-view-img" 
                    controls 
                    autoPlay 
                    playsInline
                    style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "10px", display: "block" }}
                  />
                ) : (
                  <img src={selectedFullImage.imageUrl} alt="Full View" className="full-view-img" />
                )}
                <div className="modal-fav-icon-overlay" onClick={(e) => toggleFavorite(e, selectedFullImage.imageUrl)}>
                  <img src={favorites.includes(selectedFullImage.imageUrl) ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '30px', height: '30px' }} />
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