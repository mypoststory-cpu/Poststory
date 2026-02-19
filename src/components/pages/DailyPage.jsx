import React, { useState, useEffect } from "react"; 
import axios from "axios";
import "../styles/DailyPage.css";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
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
  
  // New State for Full Screen Preview
  const [selectedFullImage, setSelectedFullImage] = useState(null);

  const cloudName = "dp3bcbwwt";

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `https://res.cloudinary.com/${cloudName}/image/list/daily_folder.json`
        );
        setImages(response.data.resources);
      } catch (error) {
        console.error("Images not load :", error);
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

  const filteredPosts = images.filter((post) => {
    const pId = post.public_id.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesLanguage = selectedLanguage === "all_lang" || pId.includes(selectedLanguage);

    if (query !== "") {
      return pId.includes(query) || (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)));
    }
    if (activeTab === "All") return matchesLanguage;
    const categorySearch = activeTab.toLowerCase().replace(/\s+/g, '_'); 
    const matchesCategory = 
      pId.includes(categorySearch) || 
      (post.tags && post.tags.some(tag => tag.toLowerCase() === activeTab.toLowerCase())) ||
      (activeTab === "Good Morning" && (pId.includes("gm") || pId.includes("morning"))) ||
      (activeTab === "Good Night" && (pId.includes("gn") || pId.includes("night"))) ||
      (activeTab === "Meals & Food" && pId.includes("meals")) || 
      (activeTab === "Daily Quotes" && pId.includes("quotes")) || 
      (activeTab === "Work & Productivity" && pId.includes("work")) ||
      (activeTab === "Fitness & Health" && pId.includes("fitnees")) || 
      (activeTab === "Evening Vibes" && pId.includes("good_evening")) || 
      (activeTab === "Daily Gratitude" && pId.includes("gratitude"));

    return matchesCategory && matchesLanguage;
  });


  const navigateImage = (direction) => {

    const imageUrls = filteredPosts.map(post => `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${post.public_id}`);
    const currentIndex = imageUrls.indexOf(selectedFullImage);

    if (direction === "next") {
      const nextIndex = (currentIndex + 1) % imageUrls.length; // Loops back to start
      setSelectedFullImage(imageUrls[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length; // Loops to end
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
          <img 
            src={backArrow} 
            alt="back" 
            className="back-icon1" 
            onClick={() => window.history.back()} 
          />
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
                <label>Sort By</label>
                <select>
                  <option value="newest">Newest Post</option>
                  <option value="oldest">Oldest Post</option>
                </select>
              </div>
              <div className="filter-item1">
                <label>Category</label>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Good Morning">Good Morning</option>
                  <option value="Good Night">Good Night</option>
                  <option value="Daily Quotes">Daily Quotes</option>
                  <option value="Meals & Food">Meals & Food</option>
                  <option value="Work & Productivity">Work & Productivity</option>
                  <option value="Fitness & Health">Fitness & Health</option>
                  <option value="Evening Vibes">Evening Vibes</option>
                  <option value="Daily Gratitude">Daily Gratitude</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-container1">
        {["All", "Good Morning", "Good Night", "Daily Quotes", "Meals & Food", "Work & Productivity", "Fitness & Health", "Evening Vibes","Daily Gratitude"].map((tab) => (
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
            const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${post.public_id}`;
            const isFavorite = favorites.includes(imageUrl);
            return (
              <div key={post.public_id} className="post-item1">
                <img 
                  src={imageUrl} 
                  alt="Daily Post"
                  className="grid-img1"
                  onClick={() => handleImageClick(imageUrl)} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }} 
                />
                <div
                  className="fav-icon-overlay"
                  onClick={(e) => toggleFavorite(e, imageUrl)}
                  style={{
                    position: 'absolute', bottom: '10px', right: '10px', cursor: 'pointer', zIndex: 10,
                    borderRadius: '50%', display: 'flex'
                  }}
                >
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '16px', height: '16px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-images-msg">Images loading or no images found...</p>
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