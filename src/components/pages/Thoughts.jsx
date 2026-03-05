import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Thoughts.css";
import Navbar from "../Navbar";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

import backArrow from "../../assets/lefta.png";
import menuIcon from "../../assets/menu.png"; 
import vectorIcon from '../../assets/Vector1.png'; 
import filledHeartIcon from '../../assets/herat.png';
import next from"../../assets/next.png";

export default function ThoughtsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang"); 
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFullImage, setSelectedFullImage] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("user_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // 1. Firebase Fetch Logic (Replacing Cloudinary/Axios)
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        // Query looks for documents where category is "Thoughts"
        const q = query(
          collection(db, "postimg"), 
          where("category", "==", "Thoughts"),
          orderBy("createdAt", "desc")
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

  const toggleFavorite = useCallback((e, imgSrc) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const isFav = prev.includes(imgSrc);
      const updated = isFav 
        ? prev.filter((fav) => fav !== imgSrc) 
        : [...prev, imgSrc];
      
      localStorage.setItem("user_favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleImageClick = (imgSrc) => {
    setSelectedFullImage(imgSrc);
    const savedRecent = localStorage.getItem("recently_viewed");
    let recentArray = savedRecent ? JSON.parse(savedRecent) : [];
    recentArray = [imgSrc, ...recentArray.filter(img => img !== imgSrc)];
    localStorage.setItem("recently_viewed", JSON.stringify(recentArray.slice(0, 20)));
  };

  const navigateImage = (direction) => {
    const imageUrls = filteredPosts.map(post => post.imageUrl);
    const currentIndex = imageUrls.indexOf(selectedFullImage);

    if (direction === "next") {
      const nextIndex = (currentIndex + 1) % imageUrls.length;
      setSelectedFullImage(imageUrls[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
      setSelectedFullImage(imageUrls[prevIndex]);
    }
  };

  const handleNextToEdit = () => {
    navigate("/post-selection", { 
      state: { 
        postImg: selectedFullImage, 
        categoryName: "Thoughts",
        subCategory: activeTab
      } 
    });
  };

  // 2. Filter logic for Firestore Data
  const filteredPosts = images.filter((img) => {
    const title = (img.title || "").toLowerCase();
    const subCat = (img.subCategory || "").toLowerCase().trim();
    const lang = (img.language || "").toLowerCase().trim();
    const queryTerm = searchQuery.toLowerCase().trim();

    const matchesLanguage = selectedLanguage === "all_lang" || lang === selectedLanguage.toLowerCase();
    if (!matchesLanguage) return false;

    if (queryTerm !== "" && !title.includes(queryTerm)) return false;

    if (activeTab === "All") return true;
    return subCat === activeTab.toLowerCase().trim();
  });

  const thoughtTabs = ["All", "Motivation", "Shayari & Poetry", "Life Lessons", "Positive Vibes"];

  return (
    <div className="cat-page-container7">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      
      <div className="cat-banner7">
        <div className="banner-content7"></div>
      </div>

      <div className="cat-filter-header7">
        <div className="left-side7">
          <img src={backArrow} alt="back" className="back-icon7" onClick={() => navigate(-1)} />
          <h3>Thoughts Posts</h3>
        </div>

        <div className="right-side7">
          <div className="filter-controls7" onClick={() => setShowFilter(!showFilter)}>
            <div className="filter-trigger7">
               <img src={menuIcon} alt="filter" className="vector-img-main7" />
            </div>

            <div className={`filter-dropdown7 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              <div className="filter-item7">
                <label>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="all_lang">All Languages</option>
                  <option value="marathi">Marathi</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>
              <div className="filter-item7">
                <label>Category</label>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                   {thoughtTabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-container7">
        {thoughtTabs.map((tab) => (
          <button 
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="posts-grid7">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Images Loading...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isFavorite = favorites.includes(post.imageUrl);

            return (
              <div key={post.id} className="post-item7" style={{ position: 'relative' }}>
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="grid-img7"
                  style={{ width: "100%", borderRadius: "10px", display: "block" }}
                  onClick={() => handleImageClick(post.imageUrl)}
                />
                <div
                  className="fav-icon-overlay"
                  onClick={(e) => toggleFavorite(e, post.imageUrl)}
                  style={{ position: 'absolute', bottom: '10px', right: '10px', cursor: 'pointer', zIndex: 10 }}
                >
                  <img
                    src={isFavorite ? filledHeartIcon : vectorIcon}
                    alt="heart"
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No images found.</p>
        )}
      </main>

      {selectedFullImage && (
        <div className="full-image-modal-overlay" onClick={() => setSelectedFullImage(null)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedFullImage(null)}>✕</button>
            <div className="modal-nav-arrow left" onClick={() => navigateImage("prev")}>
              <img src={next} alt="prev" style={{ width: '15px' }} />
            </div>
            <div className="modal-image-wrapper" style={{ position: 'relative' }}>
              <img src={selectedFullImage} alt="Big Size" className="full-view-img" />
              <div
                className="modal-fav-icon"
                onClick={(e) => toggleFavorite(e, selectedFullImage)}
                style={{
                  position: 'absolute', bottom: '20px', right: '20px', cursor: 'pointer',
                  borderRadius: '50%', padding: '10px', display: 'flex',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.2)'
                }}
              >
                <img src={favorites.includes(selectedFullImage) ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px', height: '24px' }} />
              </div>
            </div>
            <div className="modal-nav-arrow right" onClick={() => navigateImage("next")}>
              <img src={next} alt="next" style={{ width: '15px', transform: 'rotate(180deg)' }} />
            </div>
            <div className="edit-navigation-arrow" onClick={handleNextToEdit}>
              <span className="arrow-text">Continue</span>
              <img src={backArrow} alt="next" className="arrow-icon-flip" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}