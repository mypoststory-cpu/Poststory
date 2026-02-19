import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Updates.css";
import Navbar from "../Navbar";
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // New State for Full Screen Preview
    const [selectedFullImage, setSelectedFullImage] = useState(null);
  
  const cloudName = "dp3bcbwwt";

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("user_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://res.cloudinary.com/${cloudName}/image/list/update_folder.json`
        );
        setImages(response.data.resources);
      } catch (error) {
        console.error("Images not load :", error);
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
    
    // Recent views logic
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


  const filteredPosts = images.filter((img) => {
    const publicId = img.public_id.toLowerCase();
    const query = searchQuery.toLowerCase().trim();

  
    const matchesLanguage = selectedLanguage === "all_lang" || publicId.includes(selectedLanguage.toLowerCase());
    if (!matchesLanguage) return false;

    if (query !== "") {
      return publicId.includes(query);
    }

  
    if (activeTab === "All") return true;
    
    const cleanTab = activeTab.toLowerCase().split(" ")[0]; 
    return publicId.includes(cleanTab) || (activeTab === "Alerts & News" && publicId.includes("news"));
  });
  
  const navigateImage = (direction) => {

    const imageUrls = filteredPosts.map(post => `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${post.public_id}`);
    const currentIndex = imageUrls.indexOf(selectedFullImage);

    if (direction === "next") {
      const nextIndex = (currentIndex + 1) % imageUrls.length; 
      setSelectedFullImage(imageUrls[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length; 
      setSelectedFullImage(imageUrls[prevIndex]);
    }
  };

  const updateTabs = ["All", "Personal News", "Alerts & News"];

  return (
    <div className="cat-page-container9">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      
      <div className="cat-banner9">
        <div className="banner-content9"></div>
      </div>

      <div className="cat-filter-header9">
        <div className="left-side9">
          <img src={backArrow} alt="back" className="back-icon9" onClick={() => window.history.back()} />
          <h3>Updates Posts</h3>
        </div>

        <div className="right-side9">
          <div className="filter-controls9" onClick={() => setShowFilter(!showFilter)}>
            <div className="filter-trigger9">
               <img src={menuIcon} alt="filter" className="vector-img-main9" />
            </div>

            <div className={`filter-dropdown9 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              <div className="filter-item9">
                <label>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="all_lang">All Languages</option> 
                  <option value="marathi">Marathi</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>
                   <div className="filter-item1">
                <label>Sort By</label>
                <select>
                  <option value="newest">Newest Post</option>
                  <option value="oldest">Oldest Post</option>
                </select>
              </div>
              <div className="filter-item9">
                <label>Category</label>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                   {updateTabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-container9">
        {updateTabs.map((tab) => (
          <button 
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="posts-grid9">
        {loading ? (
          <p style={{ textAlign: "center", gridColumn: "1/-1" }}>Loading Updates...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${post.public_id}`;
            const isFavorite = favorites.includes(imageUrl);

            return (
              <div key={post.public_id} className="post-item9" style={{ position: 'relative' }}>
                <img 
                  src={imageUrl} 
                  alt="Updates Post"
                  className="grid-img9"
                  style={{ width: "100%", borderRadius: "10px", display: "block" }}
                 onClick={() => handleImageClick(imageUrl)} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }} 
              
              />
                

                <div
                  className="fav-icon-overlay"
                  onClick={(e) => toggleFavorite(e, imageUrl)}
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    cursor: 'pointer',
                    zIndex: 10,
                      borderRadius: '50%',
               
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
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
          <p className="no-images-msg" style={{ textAlign: "center", gridColumn: "1/-1" }}>
            {searchQuery ? `No updates found for "${searchQuery}"` : "No images found for this category."}
          </p>
        )}
      </main>

{selectedFullImage && (
  <div className="full-image-modal-overlay" onClick={() => setSelectedFullImage(null)}>
    <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close-x" onClick={() => setSelectedFullImage(null)}>✕</button>
      
      {/* Left Arrow */}
      <div className="modal-nav-arrow left" onClick={() => navigateImage("prev")}>
        <img src={next} alt="prev" style={{ width: '15px', transform: 'rotate(0deg)' }} />
      </div>

      <div className="modal-image-wrapper" style={{ position: 'relative' }}>
        <img src={selectedFullImage} alt="Big Size" className="full-view-img" />
        
        {/* Favorite Icon */}
        <div
          className="modal-fav-icon"
          onClick={(e) => toggleFavorite(e, selectedFullImage)}
          style={{
            position: 'absolute', bottom: '20px', right: '20px', cursor: 'pointer',
            borderRadius: '50%', padding: '10px', display: 'flex',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.2)'
          }}
        >
          <img 
            src={favorites.includes(selectedFullImage) ? filledHeartIcon : vectorIcon} 
            alt="heart" 
            style={{ width: '24px', height: '24px' }} 
          />
        </div>
      </div>

      {/* Right Arrow */}
      <div className="modal-nav-arrow right" onClick={() => navigateImage("next")}>
        <img src={next} alt="next" style={{ width: '15px', transform: 'rotate(180deg)' }} />
      </div>
      
      {/* Edit/Continue Button */}
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