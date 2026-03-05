import React, { useState, useEffect } from "react"; 
import "../styles/DailyPage.css";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where , doc ,getDoc} from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

import backArrow from "../../assets/lefta.png";
import menuIcon from "../../assets/menu.png"; 
import vectorIcon from '../../assets/Vector1.png';
import filledHeartIcon from '../../assets/herat.png';
import next from"../../assets/next.png";     

export default function DailyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang"); 
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFullImage, setSelectedFullImage] = useState(null);
  // 2. Fetch data from Firebase Firestore instead of Cloudinary

useEffect(() => {
  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "postimg"));

      const imgArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Total docs found:", imgArray.length);
      setImages(imgArray);

    } catch (error) {
      console.error("Firebase Error:", error);
    }
  };

  fetchImages();
}, []);


  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("user_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (e, imgSrc) => {
    e.stopPropagation();
    let updatedFavorites;
    if (favorites.includes(imgSrc)) {
      updatedFavorites = favorites.filter((fav) => fav !== imgSrc);
    } else {
      updatedFavorites = [...favorites, imgSrc];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("user_favorites", JSON.stringify(updatedFavorites));
  };

  const handleImageClick = (imgSrc) => {
    setSelectedFullImage(imgSrc);
    const savedRecent = localStorage.getItem("recently_viewed");
    let recentArray = savedRecent ? JSON.parse(savedRecent) : [];
    recentArray = [imgSrc, ...recentArray.filter(img => img !== imgSrc)];
    localStorage.setItem("recently_viewed", JSON.stringify(recentArray.slice(0, 20)));
  };

  const handleNextToEdit = () => {
    navigate("/post-selection", { 
      state: { 
        postImg: selectedFullImage, 
        categoryName: "Daily",
        subCategory: activeTab
      } 
    });
  };


const filteredPosts = images.filter((post) => {
  const queryTerm = searchQuery.toLowerCase().trim();
  
  // .trim() removes the extra space in " Daily" and "language "
  const postCategory = (post.category || "").trim();
  const postSubCategory = (post.subCategory || "").trim();
  const postLang = (post.language || post["language "] || "").toLowerCase().trim();

  const matchesLanguage = selectedLanguage === "all_lang" || postLang === selectedLanguage.toLowerCase();
  
  // This matches "Good Morning" even if there are hidden spaces
  const matchesTab = (activeTab === "All") || (postSubCategory === activeTab);

  const matchesSearch = queryTerm === "" || 
    (post.title || "").toLowerCase().includes(queryTerm);

  return matchesLanguage && matchesTab && matchesSearch;
});


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

  return (
    <div className="cat-page-container1">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      
      <div className="cat-banner1">
        <div className="banner-content1"></div>
      </div>

      <div className="cat-filter-header1">
        <div className="left-side1">
          <img src={backArrow} alt="back" className="back-icon1" onClick={() => window.history.back()} />
          <h3>Daily Posts</h3>
        </div>

        <div className="right-side1">
          <div className="filter-controls1" onClick={() => setShowFilter(!showFilter)}>
            <div className="filter-trigger1">
               <img src={menuIcon} alt="filter" className="vector-img-main1" />
            </div>
            <div className={`filter-dropdown1 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              <div className="filter-item1">
                <label>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="all_lang">All Languages</option> 
                  <option value="marathi">Marathi</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>
              <div className="filter-item1">
                <label>Category</label>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Good Morning">Good Morning</option>
                  <option value="Good Night">Good Night</option>
                  <option value="Daily Quotes">Daily Quotes</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-container1">
        {["All", "Good Morning", "Good Night", "Daily Quotes"].map((tab) => (
          <button 
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="posts-grid1">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const imageUrl = post.imageUrl; // Direct link from Firestore
            const isFavorite = favorites.includes(imageUrl);
            return (
              <div key={post.id} className="post-item1">
                <img 
                  src={post.imageUrl} 
                  alt={post.title || "Daily Post"}
                  className="grid-img1"
                  onClick={() => handleImageClick(post.imageUrl)} 
                />
                <div
                  className="fav-icon-overlay"
                  onClick={(e) => toggleFavorite(e, imageUrl)}
                >
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '16px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-images-msg">No images found...</p>
        )}
      </main>

      {selectedFullImage && (
        <div className="full-image-modal-overlay" onClick={() => setSelectedFullImage(null)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedFullImage(null)}>✕</button>
            
            <div className="modal-nav-arrow left" onClick={() => navigateImage("prev")}>
              <img src={next} alt="prev" style={{ width: '15px' }} />
            </div>

            <div className="modal-image-wrapper">
              <img src={selectedFullImage} alt="Big Size" className="full-view-img" />
              <div className="modal-fav-icon" onClick={(e) => toggleFavorite(e, selectedFullImage)}>
                <img src={favorites.includes(selectedFullImage) ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px' }} />
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