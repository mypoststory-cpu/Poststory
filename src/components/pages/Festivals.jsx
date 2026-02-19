import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Festivals.css";
import Navbar from "../Navbar";
import backArrow from "../../assets/lefta.png";
import menuIcon from "../../assets/menu.png"; 
import vectorIcon from '../../assets/Vector1.png'; 
import filledHeartIcon from '../../assets/herat.png';
import next from"../../assets/next.png";

export default function FestivalsPage() {
    const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang"); 
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);


  const [selectedFullImage, setSelectedFullImage] = useState(null);

  const cloudName = "dp3bcbwwt";
  const [searchQuery, setSearchQuery] = useState("");

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("user_favorites");
    return saved ? JSON.parse(saved) : [];
  });


  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
      
        const response = await axios.get(
          `https://res.cloudinary.com/${cloudName}/image/list/festivals.json`
        );
        setImages(response.data.resources);
      } catch (error) {
        console.error("Festivals images load error:", error);
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
  const pId = img.public_id.toLowerCase();
  const tags = img.tags ? img.tags.map(t => t.toLowerCase()) : [];
  const tab = activeTab.toLowerCase().trim();

  // 1. Language check
  const matchesLanguage = selectedLanguage === "all_lang" || pId.includes(selectedLanguage.toLowerCase());
  if (!matchesLanguage) return false;

  // 2. Category check
  if (activeTab === "All") return true;



  const matchesCategory = 
    pId.includes(tab.replace(/ /g, "_")) || 
    tags.includes(tab) ||                 
    (tab.includes("hindu") && pId.includes("hindu_festivals")) ||
    (tab.includes("islamic") && pId.includes("islamic")) ||
    (tab.includes("christian") && pId.includes("christian")) ||
    (tab.includes("national") && pId.includes("national")) ||
    (tab.includes("ganesh") && (pId.includes("ganesh") || pId.includes("ganpati"))) ||
    (tab.includes("pola") && pId.includes("pola")) ||
    (tab.includes("diwali") && (pId.includes("diwali") || pId.includes("deepavali"))) ||
    (tab.includes("champa") && pId.includes("champa")) ||
    (tab.includes("gobind") && pId.includes("gobind"));

  return matchesCategory;
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


  const festivalTabs = [
    "All",  "National Days", 
    "Seasonal", "Global Events", "Ganesh Chaturthi", "Gudi Padwa", "Shivaji Jayanti", 
    "Maharashtra Day", "Ashadhi Ekadashi", "Dahi Handi", "Vat Purnima", "Narali Purnima", 
    "Pola / Bail Pola", "Kojagari Purnima", "Anant Chaturdashi", "Khandoba Champa Sashti", 
    "Ambedkar Jayanti", "Diwali (Deepavali)", "Laxmi Pujan", "Dussehra", "Raksha Bandhan", 
    "Makar Sankranti", "Ram Navami", "Dhanteras", "Akshaya Tritiya", "Nag Panchami", 
    "Chhath Puja", "Tulsi Vivah", "Holi", "Holika Dahan", "Navratri", "Maha Shivratri", 
    "Janmashtami", "Hanuman Jayanti", "Bhai Dooj", "Karwa Chauth", "Hartalika Teej", 
    "Basant Panchami", "Guru Purnima", "Eid-ul-Fitr", "Eid-ul-Adha", "Muharram", 
    "Eid-e-Milad", "Guru Nanak Jayanti", "Buddha Purnima", "Christmas", "Good Friday", 
    "Easter", "Parsi New Year", "Mahavir Jayanti", "Guru Gobind Singh Jayanti"
  ];
  return (
    <div className="cat-page-container4">
  <Navbar onSearch={(text) => setSearchQuery(text)} />
      
      <div className="cat-banner4">
        <div className="banner-content4"></div>
      </div>

      <div className="cat-filter-header4">
        <div className="left-side4">
          <img src={backArrow} alt="back" className="back-icon4" onClick={() => window.history.back()} />
          <h3>Festivals Posts</h3>
        </div>

        <div className="right-side4">
          <div className="filter-controls4" onClick={() => setShowFilter(!showFilter)}>
            <div className="filter-trigger4">
               <img src={menuIcon} alt="filter" className="vector-img-main4" />
            </div>

            <div className={`filter-dropdown4 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              <div className="filter-item4">
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
  <select 
    value={activeTab} 
    onChange={(e) => setActiveTab(e.target.value)}
  >
    <option value="All">All</option>
 
    <option value="National Days">National Days</option>
    <option value="Seasonal">Seasonal</option>
      <option value="Global Events">Global Events</option>
     <option value="Ganesh Chaturthi">Ganesh Chaturthi</option>
     <option value="Gudi Padwa">Gudi Padwa</option>
    <option value="Shivaji Jayanti">Shivaji Jayanti</option>
    <option value="Maharashtra Day">Maharashtra Day</option>
    <option value="Ashadhi Ekadashi">Ashadhi Ekadashi</option>
    <option value="Dahi Handi">Dahi Handi</option>
    <option value="Vat Purnima">Vat Purnima</option>
    <option value="Narali Purnima">Narali Purnima</option>
    <option value="Pola / Bail Pola">Pola / Bail Pola</option>
    <option value="Kojagari Purnima">Kojagari Purnima</option>
    <option value="Anant Chaturdashi">Anant Chaturdashi</option>
    <option value="Khandoba Champa Sashti">Khandoba Champa Sashti</option>
    <option value="Ambedkar Jayanti">Ambedkar Jayanti</option>
    <option value="Diwali (Deepavali)">Diwali (Deepavali)</option>
    <option value="Laxmi Pujan">Laxmi Pujan</option>
    <option value="Dussehra">Dussehra</option>
    <option value="Raksha Bandhan">Raksha Bandhan</option>
    <option value="Makar Sankranti">Makar Sankranti</option>
    <option value="Ram Navami">Ram Navami</option>
    <option value="Dhanteras">Dhanteras</option>
    <option value="Akshaya Tritiya">Akshaya Tritiya</option>
    <option value="Nag Panchami">Nag Panchami</option>
    <option value="Chhath Puja">Chhath Puja</option>
    <option value="Tulsi Vivah">Tulsi Vivah</option>
    <option value="Holi">Holi</option>
      <option value="Holika Dahan">Holika Dahan</option>

    <option value="Navratri">Navratri</option>
    <option value="Maha Shivratri">Maha Shivratri</option>
    <option value="Janmashtami">Janmashtami</option>
    <option value="Hanuman Jayanti">Hanuman Jayanti</option>
    <option value="Bhai Dooj">Bhai Dooj</option>
    <option value="Karwa Chauth">Karwa Chauth</option>
    <option value="Hartalika Teej">Hartalika Teej</option>
  <option value="Basant Panchami">Basant Panchami</option>
    <option value="Guru Purnima">Guru Purnima</option>
    <option value="Eid-ul-Fitr">Eid-ul-Fitr</option>
    <option value="Eid-ul-Adha">Eid-ul-Adha</option>
    <option value="Muharram">Muharram</option>
    <option value="Eid-e-Milad">Eid-e-Milad</option>
    <option value="Guru Nanak Jayanti">Guru Nanak Jayanti</option>
    <option value="Buddha Purnima">Buddha Purnima</option>
    <option value="Christmas">Christmas</option>
    <option value="Good Friday">Good Friday</option>
     <option value="Easter">Easter</option>
      <option value="Parsi New Year">Parsi New Year</option>
       <option value="Mahavir Jayanti">Mahavir Jayanti</option>
        <option value="Guru Gobind Singh Jayanti">Guru Gobind Singh Jayanti</option>
  </select>
</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-container4">
        {festivalTabs.map((tab) => (
          <button 
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="posts-grid4">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Festivals Loading...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${post.public_id}`;
           const isFavorite = favorites.includes(imageUrl);

            return (
              <div key={post.public_id} className="post-item4">
                <img 
                  src={imageUrl} 
                  alt="Festival Post"
                  style={{ width: "100%", cursor: "pointer", borderRadius: "10px" }}
                
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
            zIndex: 10
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
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Category not found Images ( please check tag in Cloudinary )</p>
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