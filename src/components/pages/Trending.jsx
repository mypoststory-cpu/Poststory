import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Firebase Firestore मधून डेटा ओढण्यासाठी आवश्यक गोष्टी
import { collection, getDocs, query, where } from "firebase/firestore"; 
import { db } from "../../firebaseConfig"; 

import "../styles/Trending.css";
import Navbar from "../Navbar";

// Assets
import backArrow from "../../assets/lefta.png";
import menuIcon from "../../assets/menu.png"; 
import vectorIcon from '../../assets/Vector1.png'; 
import filledHeartIcon from '../../assets/herat.png';
import next from "../../assets/next.png";   

export default function TrendingPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang");
  const [selectedFullImage, setSelectedFullImage] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("user_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Firestore मधून फक्त Trending इमेजेस आणणे ---
  useEffect(() => {
    const fetchTrendingImages = async () => {
      setLoading(true);
      try {
        // 'postimg' कलेक्शनमध्ये अशा इमेजेस शोधा जिथे isTrending == true आहे
        const q = query(
          collection(db, "postimg"), 
          where("isTrending", "==", true) 
        );

        const querySnapshot = await getDocs(q);
        const imgArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setImages(imgArray);
      } catch (error) {
        console.error("Trending fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingImages();
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
        categoryName: "Trending" 
      } 
    });
  };

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

  // सर्च आणि लँग्वेज फिल्टर
  const filteredPosts = images.filter((post) => {
    const queryTerm = searchQuery.toLowerCase().trim();
    const postTitle = (post.title || "").toLowerCase();
    const postLang = (post.language || "").toLowerCase();

    const matchesSearch = queryTerm === "" || postTitle.includes(queryTerm);
    const matchesLanguage = selectedLanguage === "all_lang" || postLang === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="cat-page-container8">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      
      <div className="cat-banner8">
        <div className="banner-content8"></div>
      </div>

      <div className="cat-filter-header8">
        <div className="left-side8">
          <img src={backArrow} alt="back" className="back-icon8" onClick={() => navigate(-1)} />
          <h3>Trending Posts</h3>
        </div>

        <div className="right-side8">
          <div className="filter-controls8" onClick={() => setShowFilter(!showFilter)}>
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
          <p className="no-images-msg">Trending posts loading...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isFavorite = favorites.includes(post.imageUrl);
            return (
              <div key={post.id} className="post-item1">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="grid-img8" 
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
          <p className="no-images-msg">No trending images found. (Firestore मध्ये isTrending: true चेक करा)</p>
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