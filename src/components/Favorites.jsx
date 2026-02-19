import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './styles/Favorites.css';
import Navbar from "./Navbar"; 
import heartImg from '../assets/Home/2.png';
import backArrowIcon from "../assets/lefta.png";
import filledHeartIcon from "../assets/herat.png";

const likedImages = [
  "path_to_img1", "path_to_img2", "path_to_img3",
  "path_to_img4", "path_to_img5", "path_to_img6",
  "path_to_img7", "path_to_img8"
];

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  // १. पेज लोड झाल्यावर LocalStorage मधून डेटा वाचणे
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavs);
  }, []);

  // २. डबल क्लिक केल्यावर इमेज काढून टाकण्याचे फंक्शन
  const handleRemoveFavorite = (imgId) => {
    const updatedFavs = favorites.filter((img) => img.public_id !== imgId);
    setFavorites(updatedFavs); // स्टेट अपडेट करा
    localStorage.setItem("favorites", JSON.stringify(updatedFavs)); // लोकल स्टोरेज अपडेट करा
    alert("Removed from Favorites!");
  };
  const location = useLocation();
 
  const likedImages = JSON.parse(localStorage.getItem("user_favorites") || "[]");
  return (
    <div className="favorites-container">
     
      <div className="bottom-arc-container">
        <div className="bottom-arc-gradient"></div>
      </div>

     
      <Navbar />

    
      <section className="fav-banner">
        <div className="banner-content">
        
        </div>
      </section>

      <div className="liked-header">
          <div className="left-side1">
        <img 
          src={backArrowIcon} 
          className="back-arrow-img" 
          onClick={() => window.history.back()} 
        />
        <h3>My Favorites ({likedImages.length})</h3>
      </div>
      </div>


    <main className="favorites-grid">
        {likedImages.length > 0 ? (
          likedImages.map((img, index) => (
            <div key={index} className="fav-card">
              <img src={img} alt="liked" className="fav-img" />
            
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', marginTop: '50px' }}>No favorites added yet!</p>
        )}
      </main>
    </div>
  );
}