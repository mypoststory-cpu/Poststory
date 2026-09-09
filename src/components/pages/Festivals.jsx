import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, getDocs, query, where, 
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment 
} from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

import "../styles/Festivals.css";
import Navbar from "../Navbar";
import backArrow from "../../assets/lefta.png";
import menuIcon from "../../assets/menu.png"; 
import vectorIcon from '../../assets/Vector1.png'; 
import filledHeartIcon from '../../assets/herat.png';
import next from "../../assets/next.png";

const isVideo = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm');
};

export default function FestivalsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang"); 
  const [mediaFilter, setMediaFilter] = useState("all_media"); // NEW: Media Type Filter State
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFullImage, setSelectedFullImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [userMobile, setUserMobile] = useState(null); 

  useEffect(() => {
    const fetchInitialData = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.mobile) {
        setUserMobile(userData.mobile);
        try {
          const userRef = doc(db, "users", userData.mobile);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setFavorites(docSnap.data().favImages || []);
          }
        } catch (err) {
          console.error("Error fetching user favs:", err);
        }
      }
    };
    fetchInitialData();
  }, []);
// Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showFilter) {
        setShowFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showFilter]);
  // २. Festivals 
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "postimg"), where("category", "==", "Festivals"));
        const querySnapshot = await getDocs(q);
        const imgArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setImages(imgArray);
      } catch (error) {
        console.error("Firebase Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const toggleFavorite = async (e, imgSrc) => {
    e.stopPropagation();
    if (!userMobile) {
      alert("Please login to save favorites!");
      return;
    }

    const userRef = doc(db, "users", userMobile); 
    const isAlreadyFav = favorites.includes(imgSrc);

    try {
      if (isAlreadyFav) {
        setFavorites((prev) => prev.filter((fav) => fav !== imgSrc));
        await updateDoc(userRef, { 
          favImages: arrayRemove(imgSrc) 
        });
      } else {
        setFavorites((prev) => [...prev, imgSrc]);
        await setDoc(userRef, { 
          favImages: arrayUnion(imgSrc) 
        }, { merge: true });
      }
    } catch (error) {
      console.error("Favorite update error:", error);
    }
  };

  // ४. Image Click
  const handleImageClick = async (post) => {
    setSelectedFullImage(post.imageUrl);
    const savedRecent = localStorage.getItem("recently_viewed");
    let recentArray = savedRecent ? JSON.parse(savedRecent) : [];
    recentArray = [post.imageUrl, ...recentArray.filter(img => img !== post.imageUrl)];
    localStorage.setItem("recently_viewed", JSON.stringify(recentArray.slice(0, 20)));

    try {
      const postRef = doc(db, "postimg", post.id);
      await updateDoc(postRef, { clickCount: increment(1) });
    } catch (error) {
      console.error("Error updating trending count:", error);
    }
  };

  // ५. Modal Navigation
  const navigateImage = (direction) => {
    const imageUrls = filteredPosts.map(post => post.imageUrl);
    const currentIndex = imageUrls.indexOf(selectedFullImage);
    if (currentIndex === -1) return;

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
      state: { postImg: selectedFullImage, categoryName: "Festivals", subCategory: activeTab } 
    });
  };

  // ६. Filtering Logic
  const filteredPosts = images.filter((post) => {
    const queryTerm = searchQuery.toLowerCase().trim();
    const postSubCategory = (post.subCategory || "").trim().toLowerCase();
    const postLang = (post.language || "").toLowerCase().trim();
    const isPostVideo = isVideo(post.imageUrl);
    
    // 1. Language Filter
    const matchesLanguage = selectedLanguage === "all_lang" || postLang === selectedLanguage.toLowerCase();
    
    // 2. Search Filter
    const matchesSearch = queryTerm === "" || (post.title || "").toLowerCase().includes(queryTerm);
    
    // 3. Media Type Filter (NEW)
    let matchesMedia = true;
    if (mediaFilter === "images_only") {
      matchesMedia = !isPostVideo;
    } else if (mediaFilter === "videos_only") {
      matchesMedia = isPostVideo;
    }

    if (!matchesLanguage || !matchesSearch || !matchesMedia) return false;
    if (activeTab === "All") return true;

    // 4. Tab / Category Filter
    const tab = activeTab.toLowerCase().trim().replace(/\s+/g, '_');
    return postSubCategory === activeTab.toLowerCase().trim() || postSubCategory === tab;
  });

  const festivalTabs = ["All", "National Days", "Seasonal", "Global Events", "Ganesh Chaturthi", "Gudi Padwa", "Shivaji Jayanti", "Maharashtra Day", "Ashadi Ekadashi", "Dahi Handi", "Vat Purnima", "Narali Purnima", "Pola", "Kojagiri Purnima", "Anant Chaturdashi", "Khandoba Champa", "Ambedkar Jayanti", "Diwali", "Laxmi Pujan", "Dussehra","Raksha Bandhan",
"Makar Sankranti","Ram Navami","Dhanteras","Akshaya Tritiya","Nag Panchami","Chhath Puja","Tulsi Vivah","Holi","Holika Dahan","Navratri","Maha Shivratri","Janmashtami","Hanuman Jayanti","Bhai Dooj","Karwa Chauth","Hartalika Teej","Basant Panchami","Guru Purnima","Eid-ul-Fitr","Eid-ul-Adha","Muharram","Eid-e-Milad","Guru Nanak Jayanti","Buddha Purnima","Christmas","Good Friday","Easter","Parsi New Year","Mahavir Jayanti"
,"Guru Gobind Singh Jayanti"
];

  return (
    <div className="cat-page-container4">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      <div className="cat-banner4"></div>

      <div className="cat-filter-header4">
        <div className="left-side4">
          <img src={backArrow} alt="back" className="back-icon4" onClick={() => navigate(-1)} />
          <h3>Festivals Posts</h3>
        </div>
        <div className="right-side4">
          <div 
  className="filter-controls4" 
  onClick={(e) => {
    e.stopPropagation();
    setShowFilter((prev) => !prev);
  }}
>
            <div className="filter-trigger4"><img src={menuIcon} alt="filter" className="vector-img-main4" /></div>
            <div className={`filter-dropdown4 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              
              {/* Language Filter */}
              <div className="filter-item4">
                <label>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="all_lang">All Languages</option>
                  <option value="marathi">Marathi</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>

              {/* NEW: Media Type Filter */}
              <div className="filter-item4">
                <label>Media Type</label>
                <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)}>
                  <option value="all_media">All (Images & Videos)</option>
                  <option value="images_only">Only Images</option>
                  <option value="videos_only">Only Videos</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-item4">
                <label>Category</label>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                  {festivalTabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="tab-container4">
        {festivalTabs.map((tab) => (
          <button key={tab} className={`tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      <main className="posts-grid4">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Festivals Loading...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isFavorite = favorites.includes(post.imageUrl);
            return (
              <div key={post.id} className="post-item4" style={{ position: 'relative' }}>
                {isVideo(post.imageUrl) ? (
                  <video 
                    src={post.imageUrl} 
                    className="grid-img4"
                    muted
                    playsInline
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer', objectFit: 'cover' }}
                    onClick={() => handleImageClick(post)} 
                  />
                ) : (
                  <img 
                    src={post.thumbnailUrl || post.imageUrl} 
                    alt={post.title || "Festival Post"}
                    loading="lazy"
                    style={{ width: "100%", cursor: "pointer", borderRadius: "10px", display: "block" }}
                    onClick={() => handleImageClick(post)} 
                    onError={(e) => { e.target.src = 'https://placehold.jp/300x300.png'; }} 
                  />
                )}

                {/* Heart / Favorite Overlay Icon */}
                <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, post.imageUrl)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', zIndex: 2 }}>
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px', height: '24px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No posts found for selected filters.</p>
        )}
      </main>
  
      {selectedFullImage && (
        <div className="full-image-modal-overlay" onClick={() => setSelectedFullImage(null)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedFullImage(null)}>✕</button>
            <div className="modal-main-layout">
              <div className="modal-nav-arrow left" onClick={() => navigateImage("prev")}><img src={next} alt="prev" /></div>
              <div className="modal-image-wrapper">
                {isVideo(selectedFullImage) ? (
                  <video 
                    src={selectedFullImage} 
                    className="full-view-img" 
                    controls 
                    autoPlay 
                    playsInline
                    style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "10px", display: "block" }}
                  />
                ) : (
                  <img src={selectedFullImage} alt="Full View" className="full-view-img" />
                )}
                <div className="modal-fav-icon-overlay" onClick={(e) => toggleFavorite(e, selectedFullImage)}>
                  <img src={favorites.includes(selectedFullImage) ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '30px', height: '30px' }} />
                </div>
              </div>
              <div className="modal-nav-arrow right" onClick={() => navigateImage("next")}><img src={next} alt="next" style={{ transform: 'rotate(180deg)' }} /></div>
            </div>
            <div className="modal-footer-action">
              <button className="continue-btn" onClick={handleNextToEdit}>
                Continue <img src={backArrow} alt="arrow" className="btn-arrow" style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}