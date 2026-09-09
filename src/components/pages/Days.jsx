import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom";
import "../styles/Days.css";
import Navbar from "../Navbar";

// --- Firestore & Auth Imports ---
import { 
  collection, getDocs, query, where, orderBy,
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment 
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";

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

export default function DailyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang"); 
  const [mediaFilter, setMediaFilter] = useState("all_media"); // NEW: Video/Image Filter State
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFullImage, setSelectedFullImage] = useState(null);
  
  // States for Sync
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
          console.error("Error fetching user favs:", err);
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

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "postimg"), 
          where("category", "==", "Days")
        );
        
        const querySnapshot = await getDocs(q);
        const imgArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setImages(imgArray);
      } catch (error) {
        console.error("Firebase load error:", error);
      } finally {
        setLoading(false); 
      }
    };
    fetchImages();
  }, []);

  // Toggle Favorite Function
  const toggleFavorite = async (e, imgSrc) => {
    e.stopPropagation();
    
    if (!userMobile) {
      alert("Please login to add favorites!");
      return;
    }

    const userRef = doc(db, "users", userMobile);
    const isAlreadyFav = favorites.includes(imgSrc);

    try {
      if (isAlreadyFav) {
        setFavorites(prev => prev.filter(item => item !== imgSrc));
        await updateDoc(userRef, {
          favImages: arrayRemove(imgSrc)
        });
      } else {
        setFavorites(prev => [...prev, imgSrc]);
        await setDoc(userRef, {
          favImages: arrayUnion(imgSrc)
        }, { merge: true });
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
    }
  };

  const [selectedFullPost, setSelectedFullPost] = useState(null);
  const handleImageClick = async (post) => {
    setSelectedFullImage(post.imageUrl);
    setSelectedFullPost(post); 

    const savedRecent = localStorage.getItem("recently_viewed");
    let recentArray = savedRecent ? JSON.parse(savedRecent) : [];
    recentArray = [post.imageUrl, ...recentArray.filter(img => img !== post.imageUrl)];
    localStorage.setItem("recently_viewed", JSON.stringify(recentArray.slice(0, 20)));

    try {
      const postRef = doc(db, "postimg", post.id);
      await updateDoc(postRef, { clickCount: increment(1) });
    } catch (error) {
      console.error("Error updating trending count:", error);
    }
  };

  const navigateImage = (direction) => {
    const imageUrls = filteredPosts.map(post => post.imageUrl);
    const currentIndex = imageUrls.indexOf(selectedFullImage);

    if (currentIndex === -1) return;

    if (direction === "next") {
      const nextIndex = (currentIndex + 1) % imageUrls.length;
      setSelectedFullImage(imageUrls[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
      setSelectedFullImage(imageUrls[prevIndex]);
    }
  };

  // Filtering Logic (Updated for Media Filter)
  const filteredPosts = images.filter((img) => {
    const subCat = (img.subCategory || "").toLowerCase().trim();
    const lang = (img.language || "").toLowerCase().trim();
    const title = (img.title || "").toLowerCase();
    const queryTerm = searchQuery.toLowerCase().trim();
    const isPostVideo = isVideo(img.imageUrl);
    
    // 1. Language Filter
    const matchesLanguage = selectedLanguage === "all_lang" || lang === selectedLanguage.toLowerCase();
    
    // 2. Search Filter
    const matchesSearch = queryTerm === "" || title.includes(queryTerm);
    
    // 3. Media Type Filter (NEW)
    let matchesMedia = true;
    if (mediaFilter === "images_only") {
      matchesMedia = !isPostVideo;
    } else if (mediaFilter === "videos_only") {
      matchesMedia = isPostVideo;
    }

    if (!matchesLanguage || !matchesSearch || !matchesMedia) return false;
    if (activeTab === "All") return true;

    // 4. Tab / Category Filter
    const tabLower = activeTab.toLowerCase().trim();
    const tabWithUnderscore = tabLower.replace(/\s+/g, '_');
    return subCat === tabLower || subCat === tabWithUnderscore;
  });

  const handleNextToEdit = () => {
    navigate("/post-selection", { 
      state: { 
        postImg: selectedFullImage, 
        categoryName: "Days",
        subCategory: activeTab,
        description: selectedFullPost?.description || "" 
      } 
    });
  };

  const dayTabs = [
    "All", "Republic Day", "Independence Day", "Gandhi Jayanti", "Teacher's Day", 
    "Children's Day", "Mother's Day", "Father's Day", "Friendship Day", "Valentine Day",
    "Yoga Day", "Women's Day", "National Youth Day", "National Doctor's Day", "Engineer's Day", 
    "Indian Army Day", "Kargil Vijay Diwas", "Daughter's Day", "National Unity Day", 
    "Kisan Diwas"
  ];

  return (
    <div className="cat-page-container2">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      
      <div className="cat-banner2">
        <div className="banner-content2"></div>
      </div>

      <div className="cat-filter-header2">
        <div className="left-side2">
          <img src={backArrow} alt="back" className="back-icon2" onClick={() => navigate(-1)} />
          <h3>Days Posts</h3>
        </div>

        <div className="right-side2">
          <div 
  className="filter-controls2" 
  onClick={(e) => {
    e.stopPropagation();
    setShowFilter((prev) => !prev);
  }}
>
            <div className="filter-trigger2">
               <img src={menuIcon} alt="filter" className="vector-img-main2" />
            </div>

            <div className={`filter-dropdown2 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              
              {/* Language Filter */}
              <div className="filter-item2">
                <label>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="all_lang">All Languages</option>
                  <option value="marathi">Marathi</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>

              {/* NEW: Media Type Filter Dropdown */}
              <div className="filter-item2">
                <label>Media Type</label>
                <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)}>
                  <option value="all_media">All (Images & Videos)</option>
                  <option value="images_only">Only Images</option>
                  <option value="videos_only">Only Videos</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-item2">
                <label>Category</label>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                   {dayTabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="tab-container2">
        {dayTabs.map((tab) => (
          <button 
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="posts-grid2">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Content Loading...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isFavorite = favorites.includes(post.imageUrl);

            return (
              <div key={post.id} className="post-item2" style={{ position: 'relative' }}>
                {isVideo(post.imageUrl) ? (
                  <video 
                    src={post.imageUrl} 
                    className="grid-img2"
                    muted
                    playsInline
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer', objectFit: 'cover' }}
                    onClick={() => handleImageClick(post)} 
                  />
                ) : (
                  <img 
                    src={post.thumbnailUrl || post.imageUrl} 
                    alt={post.title || "Days Post"}
                    className="grid-img2"
                    loading="lazy"
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer' }}
                    onClick={() => handleImageClick(post)} 
                  />
                )}
                {/* Heart / Favorite Overlay Icon */}
                <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, post.imageUrl)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', zIndex: 2 }}>
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px', height: '24px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No posts found for selected filters.</p>
        )}
      </main>

      {/* Modal Section */}
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
                  <img 
                    src={favorites.includes(selectedFullImage) ? filledHeartIcon : vectorIcon} 
                    alt="heart" 
                    style={{ width: '30px', height: '30px' }} 
                  />
                </div>
              </div>
              <div className="modal-nav-arrow right" onClick={() => navigateImage("next")}>
                <img src={next} alt="next" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
            <div className="modal-footer-action">
              <button className="continue-btn" onClick={handleNextToEdit}>
                Continue <img src={backArrow} alt="arrow" className="btn-arrow" style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}