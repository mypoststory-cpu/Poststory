import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './styles/Favorites.css';
import Navbar from "./Navbar"; 
import backArrowIcon from "../assets/lefta.png";

export default function Favorites() {
  // 1. Ekach key vapra: "user_favorites"
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Component load hotana data fatch kara
    const savedFavs = JSON.parse(localStorage.getItem("user_favorites")) || [];
    setFavorites(savedFavs);
  }, []);

  const handleEditImage = (imgUrl) => {
    navigate("/post-selection", { 
      state: { 
        postImg: imgUrl,
        categoryName: "Favorite", 
        subCategory: "My Post" 
      } 
    });
  };

  const handleRemoveFavorite = (imgUrl) => {
    const updatedFavs = favorites.filter((img) => img !== imgUrl);
    setFavorites(updatedFavs); 
    // Local storage update kara
    localStorage.setItem("user_favorites", JSON.stringify(updatedFavs)); 
  };

  return (


    <div className="favorites-container">
      <div className="bottom-arc-container">
        <div className="bottom-arc-gradient"></div>
      </div>

      <Navbar />
<div className="cat-banner8">
        <div className="banner-content8"></div>
      </div>


      <div className="liked-header">
        <div className="left-side1">
          <img 
            src={backArrowIcon} 
            className="back-arrow-img" 
            onClick={() => navigate(-1)} 
            alt="back"
          />
          {/* favorites.length use kara direct state madhun */}
          <h3>My Favorites ({favorites.length})</h3>
        </div>
      </div>

      <main className="favorites-grid">
        {favorites.length > 0 ? (
          favorites.map((img, index) => (
            <div key={index} className="fav-card">
              <img 
                src={img} 
                alt="liked" 
                className="fav-img" 
                onClick={() => handleEditImage(img)} 
                style={{ cursor: 'pointer' }} 
              />
              <button 
                className="remove-fav-btn" 
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleRemoveFavorite(img);
                }}
              >
                &times;
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
            No favorites added yet!
          </p>
        )}
      </main>
    </div>
  );
}