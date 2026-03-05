import React, { useState, useEffect } from "react";
import './styles/Home.css';
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
// --- NAVIN BADAL: Firestore imports ---
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebaseConfig"; 

import vectorIcon from '../assets/Vector1.png';
import filledHeartIcon from '../assets/herat.png';
import backArrow from '../assets/lefta.png'; 
import catDaily from '../assets/Category/Daily.png';
import catDevotion from '../assets/Category/Devotion.png';
import catFestivals from '../assets/Category/Festivals.png';
import catWishes from '../assets/Category/Wishes.png';
import catThoughts from '../assets/Category/Thoughts.png';
import catFunny from '../assets/Category/Funny.png';
import catDays from '../assets/Category/Days.png';
import catUpdates from '../assets/Category/Updates.png';

export default function Home() {
  const navigate = useNavigate();
  const [trendingList, setTrendingList] = useState([]);
  const [forYouList, setForYouList] = useState([]);
  const [selectedFullImage, setSelectedFullImage] = useState(null);

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
        categoryName: "Home",
        subCategory: "Trending"
      } 
    });
  };

  // --- NAVIN BADAL: Firestore मधून Trending इमेजेस लोड करणे ---
  useEffect(() => {
    const fetchTrendingImages = async () => {
      try {
        // 'postimg' कलेक्शनमधून फक्त trending इमेजेस (पहिले १०) आणा
        const q = query(
          collection(db, "postimg"), 
          where("isTrending", "==", true),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const latestImages = querySnapshot.docs.map(doc => doc.data().imageUrl);
        
        setTrendingList(latestImages);
      } catch (error) {
        console.error("Home trending images error:", error);
      }
    };
    fetchTrendingImages();
  }, []);

  useEffect(() => {
    const savedRecent = localStorage.getItem("recently_viewed");
    if (savedRecent) {
      const parsedData = JSON.parse(savedRecent);
      setForYouList(parsedData.length > 0 ? parsedData : trendingList);
    } else {
      setForYouList(trendingList);
    }
  }, [trendingList]); 

  const categoryList = [
    { name: "Daily", img: catDaily },
    { name: "Devotion", img: catDevotion },
    { name: "Festivals", img: catFestivals },
    { name: "Wishes", img: catWishes },
    { name: "Thoughts", img: catThoughts },
    { name: "Funny", img: catFunny },
    { name: "Days", img: catDays },
    { name: "Updates", img: catUpdates },
  ];

  return (
    <div className="home-container">
      <Navbar />
      <main>
        <section className="banner">
          <div className="banner-text"></div>
          <div className="banner-logo-container"></div>
        </section>

        {/* Trending Section */}
        <section className="section">
          <div className="section-header">
            <h3>Trending</h3>
            <span onClick={() => navigate("/trending")}>Show All</span>
          </div>
          <div className="card-row">
            {trendingList.length > 0 ? (
              trendingList.map((imgSrc, index) => {
                const isFavorite = favorites.includes(imgSrc);
                return (
                  <div key={index} className="post-card" style={{ position: 'relative' }}>
                    <img
                      src={imgSrc}
                      className="card-img-full"
                      alt="trending"
                      onClick={() => handleImageClick(imgSrc)}
                    />
                    <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, imgSrc)}
                      style={{ position: 'absolute', bottom: '1px', right: '1px', cursor: 'pointer', zIndex: 10 }}>
                      <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '18px', height: '18px' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{marginLeft: '20px', color: '#888', fontSize: '13px'}}>No trending posts available.</p>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories">
          {categoryList.map((cat) => (
            <div key={cat.name} className="category" onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}>
              <div className="ring"><img src={cat.img} alt={cat.name} className="cat-img" /></div>
              <span>{cat.name}</span>
            </div>
          ))}
        </section>

        {/* For You Section */}
        <section className="section">
          <div className="section-header">
            <h3>For you</h3>
            <span onClick={() => navigate("/foru")} style={{ cursor: 'pointer' }}>Show All</span>
          </div>
          <div className="card-row">
            {forYouList.length > 0 ? (
              forYouList.map((imgSrc, index) => {
                const isFavorite = favorites.includes(imgSrc);
                return (
                  <div key={index} className="post-card" style={{ position: 'relative' }}>
                    <img
                      src={imgSrc}
                      className="card-img-full"
                      alt="for you"
                      onClick={() => handleImageClick(imgSrc)}
                    />
                    <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, imgSrc)}
                      style={{ position: 'absolute', bottom: '1px', right: '1px', cursor: 'pointer', zIndex: 10 }}>
                      <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '18px', height: '18px' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{marginLeft: '20px', color: '#888', fontSize: '13px'}}>No history yet.</p>
            )}
          </div>
        </section>
      </main>

      {/* --- Full Image Preview Modal --- */}
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