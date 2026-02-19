import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import backArrow from "../../assets/lefta.png";
import "../styles/SearchPage.css";

export default function SearchPage() {
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("q") || "";
  const cloudName = "dp3bcbwwt";

 
  const folders = [
  "daily_folder", 
  "festivals", 
  "days_folder", 
  "thoughts", 
  "funny_folder", 
  "devotion_folder", 
  "update_folder",
  "wishes_folder" 
];
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const requests = folders.map(f => 
          axios.get(`https://res.cloudinary.com/${cloudName}/image/list/${f}.json`)
               .catch(err => {
                 console.warn(`Folder "${f}" fetch failed:`, err.response?.status);
                 return null; 
               })
        );

        const responses = await Promise.all(requests);

        const combined = responses
          .filter(res => res !== null && res.data)
          .flatMap(res => res.data.resources);

        setAllImages(combined);
      } catch (err) {
        console.error("General Data load error", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

 const searchResults = allImages.filter(img => {
  const imageName = img.public_id.toLowerCase();
  const searchWord = query.toLowerCase().trim();

  if (searchWord.includes(" ")) {

    const exactPhrase = searchWord.replace(/\s+/g, '_'); 
    const simplePhrase = searchWord.replace(/\s+/g, ''); 
    
    return imageName.includes(exactPhrase) || imageName.includes(simplePhrase);
  }


  return imageName.includes(searchWord);
});
  return (
    <div className="search-page-container" >
      <Navbar />
      
      <div >
        <div className="back">
         <img 
  src={backArrow} 
  alt="back" 
  className="back-icon" 
  onClick={() => navigate("/home")}
  style={{ cursor: 'pointer' }}
/>
          <h3 style={{ color: 'white', margin: 0 }}>Search Results for: "{query}"</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
             <p style={{ color: 'white' }}>Searching across all categories...</p>
             {/*  */}
          </div>
        ) : (
          <div className="posts-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '10px',
            width:'100%',
          }}>
            {searchResults.length > 0 ? (
              searchResults.map((img, index) => {
                const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${img.public_id}`;
                return (
                  <div key={`${img.public_id}-${index}`} className="post-card"> 
                    <img 
                      src={imageUrl} 
                      alt="search-result"
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
                        state: { postImg: imageUrl, categoryName: "Search" } 
                      })}
                    />
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: '50px' }}>
                <p style={{ color: 'gray', fontSize: '18px' }}>No images found matching your search.</p>
                <button 
                  onClick={() => navigate("/home")}
                  style={{ background: '#ff4757', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', marginTop: '10px' }}
                >
                  Go back to Home
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}