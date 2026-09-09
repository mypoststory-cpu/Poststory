import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './styles/Favorites.css';
import Navbar from "./Navbar"; 
import backArrowIcon from "../assets/lefta.png";
import { doc, getDoc, updateDoc, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; 

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        
        if (userData && userData.mobile) {
          const userRef = doc(db, "users", userData.mobile);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const favUrls = docSnap.data().favImages || [];
            
            if (favUrls.length > 0) {
       
              const q = query(
                collection(db, "postimg"), 
                where("imageUrl", "in", favUrls.slice(0, 30)) 
              );
              
              const querySnapshot = await getDocs(q);
              const favData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              setFavorites(favData);
            } else {
              setFavorites([]);
            }
          }
        } else {
          navigate("/registration");
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const handleRemoveFavorite = async (post) => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData || !userData.mobile) return;

    try {
      const userRef = doc(db, "users", userData.mobile);
      await updateDoc(userRef, {
        favImages: arrayRemove(post.imageUrl)
      });

      setFavorites(prev => prev.filter(item => item.id !== post.id));
    } catch (error) {
      console.error("Remove error:", error);
    }
  };

  const handleEditImage = (imgUrl) => {
    navigate("/post-selection", { 
      state: { postImg: imgUrl, categoryName: "Favorite" } 
    });
  };

  if (loading) {
    return (
      <div className="favorites-container flex-center">
        <p style={{ color: 'white' }}>Loading your personal favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <Navbar />
      <div className="liked-header">
        <div className="left-side1">
          <img src={backArrowIcon} className="back-arrow-img" onClick={() => navigate(-1)} alt="back" />
          <h3>My Favorites ({favorites.length})</h3>
        </div>
      </div>

      <main className="favorites-grid">
        {favorites.length > 0 ? (
          favorites.map((post) => (
            <div key={post.id} className="fav-card">
              <img 
                src={post.thumbnailUrl || post.imageUrl} 
                alt="liked" 
                className="fav-img" 
                loading="lazy"
                onClick={() => handleEditImage(post.imageUrl)} 
              />
              <button 
                className="remove-fav-btn" 
                onClick={() => handleRemoveFavorite(post)}
              > 
                &times; 
              </button>
            </div>
          ))
        ) : (
          <div className="no-fav-msg">
            <p style={{ color: 'white' }}>No favorites found for your account.</p>
            <button onClick={() => navigate("/home")} className="explore-btn">Explore Now</button>
          </div>
        )}
      </main>
    </div>
  );
}