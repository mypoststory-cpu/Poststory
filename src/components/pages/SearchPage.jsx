import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import backArrow from "../../assets/lefta.png";
import "../styles/SearchPage.css";
// --- Firestore Imports ---
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  
  const searchQuery = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const fetchSearchData = async () => {
      if (!searchQuery) return;
      
      setLoading(true);
      try {
        const postsRef = collection(db, "postimg");
        const querySnapshot = await getDocs(postsRef);
        
        const searchWord = searchQuery.toLowerCase().trim();

      
        const filtered = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(post => {
            const title = (post.title || "").toLowerCase();
            const category = (post.category || "").toLowerCase();
            const subCategory = (post.subCategory || "").toLowerCase();
 
            const keywords = Array.isArray(post.keywords) 
              ? post.keywords.map(k => k.toLowerCase()) 
              : [];

            return (
              title.includes(searchWord) ||
              category.includes(searchWord) ||
              subCategory.includes(searchWord) ||
              keywords.some(k => k.includes(searchWord))
            );
          });

        setSearchResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
  }, [searchQuery]);

  return (
    <div className="search-page-container">
      <Navbar />
      
      <div>
        <div className="back" style={{ display: 'flex', alignItems: 'center', padding: '1px', gap: '10px' }}>
          <img 
            src={backArrow} 
            alt="back" 
           className="back-icon6"
            onClick={() => navigate("/home")}
            style={{ cursor: 'pointer', width: '24px' }}
          />
          <h3 style={{ color: 'white', margin: 0 }}>Results for: "{searchQuery}"</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
             <p style={{ color: 'white' }}>Searching in database...</p>
          </div>
        ) : (
          <div className="posts-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '10px',
            width:'100%',
            padding: '0 10px'
          }}>
            {searchResults.length > 0 ? (
              searchResults.map((post, index) => (
                <div key={post.id || index} className="post-card"> 
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    style={{ 
                      width: '100%', 
                      aspectRatio: '1/1', 
                      objectFit: 'cover', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      display:'block',
                      height:'130px',
                      border: '1px solid #333'
                    }}
                    onClick={() => navigate("/post-selection", { 
                      state: { postImg: post.imageUrl, categoryName: post.category } 
                    })}
                  />
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: '50px' }}>
                <p style={{ color: 'gray', fontSize: '16px' }}>No matches found for "{searchQuery}"</p>
                <button 
                  onClick={() => navigate("/home")}
                  style={{ background: '#daa520', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '25px', marginTop: '10px', fontWeight: 'bold' }}
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}