import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Thoughts.css";
import Navbar from "../Navbar";
import { 
  collection, getDocs, query, where, orderBy, 
  doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove, increment 
} from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

// Assets
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

export default function ThoughtsPage() {
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

  // १. Fetch User Data and Favorites
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

  // २. Load Firestore Posts
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "postimg"), 
          where("category", "==", "Thoughts"),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const imgArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setImages(imgArray);
      } catch (error) {
        console.error("Firebase load error:", error);
      } finally {
        setLoading(false); 
      }
    };
    fetchImages();
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
  // ३. Toggle Favorite (Firestore Update)
  const toggleFavorite = async (e, imgSrc) => {
    e.stopPropagation();
    
    if (!userMobile) {
      alert("Please login to add favorites!");
      return;
    }

    const userRef = doc(db, "users", userMobile);
    const isAlreadyFav = favorites.includes(imgSrc);

    try {
      if (isAlreadyFav) {
        setFavorites(prev => prev.filter(item => item !== imgSrc));
        await updateDoc(userRef, {
          favImages: arrayRemove(imgSrc)
        });
      } else {
        setFavorites(prev => [...prev, imgSrc]);
        await setDoc(userRef, { favImages: arrayUnion(imgSrc) }, { merge: true });
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
    }
  };

  // ४. Image/Video Click + Trending Count Increment
  const handleImageClick = async (post) => {
    setSelectedFullImage(post.imageUrl);
    
    const savedRecent = localStorage.getItem("recently_viewed");
    let recentArray = savedRecent ? JSON.parse(savedRecent) : [];
    recentArray = [post.imageUrl, ...recentArray.filter(img => img !== post.imageUrl)];
    localStorage.setItem("recently_viewed", JSON.stringify(recentArray.slice(0, 20)));

    // Update Click count for Trending logic
    try {
      const postRef = doc(db, "postimg", post.id);
      await updateDoc(postRef, {
        clickCount: increment(1) 
      });
    } catch (error) {
      console.error("Error updating trending count:", error);
    }
  };

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
      state: { 
        postImg: selectedFullImage, 
        categoryName: "Thoughts",
        subCategory: activeTab
      } 
    });
  };

  // ५. Filtering logic (Search + Language + Media Filter)
  const filteredPosts = images.filter((img) => {
    const title = (img.title || "").toLowerCase();
    const subCat = (img.subCategory || "").toLowerCase().trim();
    const lang = (img.language || "").toLowerCase().trim();
    const queryTerm = searchQuery.toLowerCase().trim();
    const isPostVideo = isVideo(img.imageUrl);

    // Language Filter
    const matchesLanguage = selectedLanguage === "all_lang" || lang === selectedLanguage.toLowerCase();
    
    // Search Filter
    const matchesSearch = queryTerm === "" || title.includes(queryTerm);
    
    // Media Type Filter (NEW)
    let matchesMedia = true;
    if (mediaFilter === "images_only") {
      matchesMedia = !isPostVideo;
    } else if (mediaFilter === "videos_only") {
      matchesMedia = isPostVideo;
    }

    if (!matchesLanguage || !matchesSearch || !matchesMedia) return false;
    if (activeTab === "All") return true;
    return subCat === activeTab.toLowerCase().trim();
  });

  const thoughtTabs = ["All", "Motivation", "Shayari & Poetry", "Life Lessons", "Positive Vibes"];

  return (
    <div className="cat-page-container7">
      <Navbar onSearch={(text) => setSearchQuery(text)} />
      
      <div className="cat-banner7">
        <div className="banner-content7"></div>
      </div>

      <div className="cat-filter-header7">
        <div className="left-side7">
          <img src={backArrow} alt="back" className="back-icon7" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
          <h3>Thoughts Posts</h3>
        </div>

        <div className="right-side7">
          <div className="filter-controls7" onClick={(e) => {
    e.stopPropagation();
    setShowFilter((prev) => !prev);
  }}>
            <div className="filter-trigger7">
               <img src={menuIcon} alt="filter" className="vector-img-main7" />
            </div>

            <div className={`filter-dropdown7 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              
              {/* Language Option */}
              <div className="filter-item7">
                <label>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="all_lang">All Languages</option>
                  <option value="marathi">Marathi</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>

              {/* NEW: Media Type Filter */}
              <div className="filter-item7">
                <label>Media Type</label>
                <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)}>
                  <option value="all_media">All (Images & Videos)</option>
                  <option value="images_only">Only Images</option>
                  <option value="videos_only">Only Videos</option>
                </select>
              </div>

              {/* Category Option */}
              <div className="filter-item7">
                <label>Category</label>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                   {thoughtTabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="tab-container7">
        {thoughtTabs.map((tab) => (
          <button 
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="posts-grid7">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'white' }}>Posts Loading...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isFavorite = favorites.includes(post.imageUrl);

            return (
              <div key={post.id} className="post-item7" style={{ position: 'relative' }}>
                {isVideo(post.imageUrl) ? (
                  <video 
                    src={post.imageUrl} 
                    className="grid-img7"
                    muted
                    playsInline
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer', objectFit: 'cover' }}
                    onClick={() => handleImageClick(post)} 
                  />
                ) : (
                  <img 
                    src={post.thumbnailUrl || post.imageUrl}
                    alt={post.title || "Thoughts Post"}
                    className="grid-img7"
                    loading="lazy"
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer' }}
                    onClick={() => handleImageClick(post)}
                    onError={(e) => { e.target.src = 'https://placehold.jp/300x300.png'; }}
                  />
                )}

                {/* Heart / Favorite Overlay Icon inside Grid */}
                <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, post.imageUrl)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', zIndex: 2 }}>
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px', height: '24px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'white' }}>No posts found.</p>
        )}
      </main>

      {/* Full View Modal */}
      {selectedFullImage && (
        <div className="full-image-modal-overlay" onClick={() => setSelectedFullImage(null)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedFullImage(null)}>✕</button>
            <div className="modal-main-layout">
              <div className="modal-nav-arrow left" onClick={() => navigateImage("prev")}>
                <img src={next} alt="prev" />
              </div>
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
                  <img 
                    src={favorites.includes(selectedFullImage) ? filledHeartIcon : vectorIcon} 
                    alt="heart" 
                    style={{ width: '30px', height: '30px' }}
                  />
                </div>
              </div>
              <div className="modal-nav-arrow right" onClick={() => navigateImage("next")}>
                <img src={next} alt="next" style={{ transform: 'rotate(180deg)' }} />
              </div>
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