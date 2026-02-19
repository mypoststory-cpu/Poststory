import React, { useState, useEffect, useCallback } from "react";
import "../styles/Foru.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import backArrow from "../../assets/lefta.png";
import menuIcon from "../../assets/menu.png"; 
import vectorIcon from '../../assets/Vector1.png'; 
import filledHeartIcon from '../../assets/herat.png';

export default function ForuPage() {
  const navigate = useNavigate();
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false); 


  const [selectedFullImage, setSelectedFullImage] = useState(null);


  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("user_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    setLoading(true);
    const data = localStorage.getItem("recently_viewed");
    if (data) {
      setRecentImages(JSON.parse(data));
    }
    setLoading(false);
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


  const handleImagePreview = (imgUrl) => {
    setSelectedFullImage(imgUrl);
    

    const updatedRecent = [imgUrl, ...recentImages.filter(img => img !== imgUrl)];
    localStorage.setItem("recently_viewed", JSON.stringify(updatedRecent.slice(0, 20)));
    setRecentImages(updatedRecent);
  };

  const handleNextToEdit = () => {
    navigate("/post-selection", { 
      state: { postImg: selectedFullImage, categoryName: "Recently Viewed" } 
    });
  };

  const filteredRecent = recentImages.filter((imgUrl) => {
    const query = searchQuery.toLowerCase().trim();
    if (query === "") return true;
    return imgUrl.toLowerCase().includes(query);
  });

  return (
    <div className="cat-page-container5">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
        
      <div className="cat-banner1">
        <div className="banner-content1"></div>
      </div>

      <div className="cat-filter-header1">
        <div className="left-side1">
          <img 
            src={backArrow} 
            alt="back" 
            className="back-icon1" 
            onClick={() => window.history.back()} 
          />
          <h3>Recent Post</h3>
        </div>

        <div className="right-side1">
          <div className="filter-controls1" onClick={() => setShowFilter(!showFilter)}>
       
          </div>
        </div>
      </div>

      <main className="posts-grid5">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Loading...</p>
        ) : filteredRecent.length > 0 ? (
          filteredRecent.map((imgUrl, index) => {
            const isFavorite = favorites.includes(imgUrl);

            return (
              <div key={index} className="post-item5" style={{ position: 'relative' }}>
                <img 
                  src={imgUrl} 
                  alt="Recent Post"
                  className="grid-img5"
                  onClick={() => handleImagePreview(imgUrl)}
                />
                <div
                  className="fav-icon-overlay"
                  onClick={(e) => toggleFavorite(e, imgUrl)}
                  style={{
                    position: 'absolute', bottom: '10px', right: '10px', cursor: 'pointer', zIndex: 10
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
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '20px' }}>
             <p>No Recent Posts</p>
             <button className="explore-btn" onClick={() => navigate("/")}>Explore Posts</button>
          </div>
        )}
      </main>

      {selectedFullImage && (
        <div className="full-image-modal-overlay" onClick={() => setSelectedFullImage(null)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedFullImage(null)}>✕</button>
            <img src={selectedFullImage} alt="Big Size" className="full-view-img" />
            
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