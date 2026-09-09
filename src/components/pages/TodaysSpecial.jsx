import React, { useState, useEffect } from "react"; 
import "../styles/DailyPage.css"; 
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { 
  collection, getDocs, query, where, orderBy,
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment 
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

export default function TodaysSpecial() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang"); 
  const [mediaFilter, setMediaFilter] = useState("all_media"); 
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFullImage, setSelectedFullImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [userMobile, setUserMobile] = useState(null);
  const [loading, setLoading] = useState(true);


  const dailyTabs = ["All", "Daily", "Devotional", "Festivals", "Wishes", "Thoughts", "Funny", "Days"];

  // 1. Load User Data & Favorites
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

 // Locate this section inside TodaysSpecial.js[cite: 1]
useEffect(() => {
  const fetchSpecialImages = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const todayKey = `${day}-${month}`; // Confirms exact format structure matching e.g., "16-06"[cite: 1]

      const q = query(
        collection(db, "postimg"), 
        where("eventDate", "==", todayKey) // Matches the clean key in DB[cite: 1]
      );
      
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
  fetchSpecialImages();
}, []); // Triggers cleanly on mount[cite: 1]

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
        setFavorites(prev => prev.filter((fav) => fav !== imgSrc));
        await updateDoc(userRef, { favImages: arrayRemove(imgSrc) });
      } else {
        setFavorites(prev => [...prev, imgSrc]);
        await setDoc(userRef, { favImages: arrayUnion(imgSrc) }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const handleImageClick = async (post) => {
    setSelectedFullImage(post.imageUrl);
    try {
      const postRef = doc(db, "postimg", post.id);
      await updateDoc(postRef, { clickCount: increment(1) });
    } catch (error) {
      console.error("Click increment error:", error);
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

  // 3. FIXED: Filtering logic (Added proper string casing and 'All' check)
  const filteredPosts = images.filter((post) => {
    const postCategory = (post.category || "").toLowerCase().trim();
    const currentTab = activeTab.toLowerCase().trim();
    
    // जर 'All' सिलेक्ट असेल तर सर्व कॅटेगरी दाखवा, नाहीतर मॅच करा
    const matchesTab = currentTab === "all" || postCategory === currentTab || (currentTab === "devotional" && postCategory === "devotion");
    
    const postLang = (post.language || "").toLowerCase().trim();
    const matchesLang = selectedLanguage === "all_lang" || postLang === selectedLanguage.toLowerCase().trim();
    
    const title = (post.title || "").toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase().trim());
    
    let matchesMedia = true;
    const isPostVideo = isVideo(post.imageUrl);
    if (mediaFilter === "images_only") {
      matchesMedia = !isPostVideo;
    } else if (mediaFilter === "videos_only") {
      matchesMedia = isPostVideo;
    }

    return matchesTab && matchesLang && matchesSearch && matchesMedia;
  });

  return (
     <div className="cat-page-container2">
         <Navbar onSearch={(text) => setSearchQuery(text)} />
         
         <div className="cat-banner2">
           <div className="banner-content2"></div>
         </div>
   
         <div className="cat-filter-header2">
           <div className="left-side2">
             <img src={backArrow} alt="back" className="back-icon2" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
             <h3>Today's Specials</h3>
           </div>
   
           <div className="right-side2">
             <div className="filter-controls2" onClick={(e) => {
    e.stopPropagation();
    setShowFilter((prev) => !prev);
  }}>
               <div className="filter-trigger2">
                  <img src={menuIcon} alt="filter" className="vector-img-main2" />
               </div>
   
               <div className={`filter-dropdown2 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
                 
                 {/* Language Filter */}
                 <div className="filter-item2">
                   <label>Language</label>
                   <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                     <option value="all_lang">All Languages</option>
                     <option value="marathi">Marathi</option>
                     <option value="hindi">Hindi</option>
                     <option value="english">English</option>
                   </select>
                 </div>

                 {/* Media Type Filter */}
                 <div className="filter-item2">
                   <label>Media Type</label>
                   <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)}>
                     <option value="all_media">All (Images & Videos)</option>
                     <option value="images_only">Only Images</option>
                     <option value="videos_only">Only Videos</option>
                   </select>
                 </div>

                 {/* Category Filter */}
                 <div className="filter-item2">
                   <label>Category</label>
                   <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                      {dailyTabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                   </select>
                 </div>

               </div>
             </div>
           </div>
         </div>

         {/* Top Tab Bar Navigation */}
         <div className="tab-container2" style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 15px' }}>
           {dailyTabs.map((tab) => (
             <button 
               key={tab}
               className={`tab ${activeTab === tab ? "active" : ""}`}
               onClick={() => setActiveTab(tab)}
               style={{ whiteSpace: 'nowrap' }}
             >
               {tab}
             </button>
           ))}
         </div>

      <main className="posts-grid1">
        {loading ? (
          <p className="no-images-msg" style={{ textAlign: 'center', gridColumn: '1/-1' }}>Loading today's specials...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isFavorite = favorites.includes(post.imageUrl);

            return (
              <div key={post.id} className="post-item1" style={{ position: 'relative' }}>
                {isVideo(post.imageUrl) ? (
                  <video 
                    src={post.imageUrl} 
                    className="grid-img1"
                    muted
                    playsInline
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer', objectFit: 'cover' }}
                    onClick={() => handleImageClick(post)} 
                  />
                ) : (
                  <img 
                    src={post.thumbnailUrl || post.imageUrl}
                    alt={post.title || "Special Post"}
                    className="grid-img1"
                    loading="lazy"
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer' }}
                    onClick={() => handleImageClick(post)} 
                    onError={(e) => { e.target.src = 'https://placehold.jp/300x300.png'; }}
                  />
                )}

                <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, post.imageUrl)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', zIndex: 2 }}>
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px', height: '24px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-images-msg" style={{ textAlign: 'center', gridColumn: '1/-1' }}>No posts found for this category today.</p>
        )}
      </main>

      {/* Full Screen Modal */}
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
              <button className="continue-btn" onClick={() => navigate("/post-selection", { state: { postImg: selectedFullImage, categoryName: "Special", subCategory: activeTab } })}>
                Continue <img src={backArrow} alt="arrow" className="btn-arrow" style={{transform: 'rotate(180deg)'}} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}