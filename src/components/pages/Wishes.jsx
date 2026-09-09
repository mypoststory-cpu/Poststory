import React, { useState, useEffect, useRef } from "react";
import "../styles/Wishes.css";
import Navbar from "../Navbar";
import backArrow from "../../assets/lefta.png";
import { useNavigate } from "react-router-dom";
import { 
  collection, getDocs, query, where, orderBy, 
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment 
} from "firebase/firestore";
import { db } from "../../firebaseConfig"; 
import create from "../../assets/upload.png"
import menuIcon from "../../assets/menu.png"; 
import vectorIcon from '../../assets/Vector1.png'; 
import filledHeartIcon from '../../assets/herat.png';
import next from "../../assets/next.png";    

const isVideo = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm');
};

export default function DailyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("all_lang"); 
  const [mediaFilter, setMediaFilter] = useState("all_media"); 
  const [showFilter, setShowFilter] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFullImage, setSelectedFullImage] = useState(null);
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Navigate to editor with the local image data
        navigate("/post-selection", { 
          state: { 
            postImg: reader.result, 
            isCustom: true,
            categoryName: "Custom",
            subCategory: "User Upload"
          } 
        });
      };
      reader.readAsDataURL(file);
    }
  };
  // States for Sync
  const [favorites, setFavorites] = useState([]);
  const [userMobile, setUserMobile] = useState(null);
  const STATIC_POST = {
  id: "static-custom-post",
  isStatic: true,
  imageUrl: "../../assets/", // e.g., "../../assets/create-your-own.png"
  title: "Create Your Own Post"
};
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
          console.error("Error fetching user data:", err);
        }
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "postimg"), 
          where("category", "==", "Wishes"),
          orderBy("createdAt", "desc")
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
        await updateDoc(userRef, { favImages: arrayRemove(imgSrc) });
      } else {
        setFavorites((prev) => [...prev, imgSrc]);
        await setDoc(userRef, { favImages: arrayUnion(imgSrc) }, { merge: true });
      }
    } catch (error) {
      console.error("Favorite update error:", error);
    }
  };
 
  const handleImageClick = async (post) => {
    setSelectedFullImage(post.imageUrl);

    const savedRecent = localStorage.getItem("recently_viewed");
    let recentArray = savedRecent ? JSON.parse(savedRecent) : [];
    recentArray = [post.imageUrl, ...recentArray.filter(img => img !== post.imageUrl)];
    localStorage.setItem("recently_viewed", JSON.stringify(recentArray.slice(0, 20)));

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
        categoryName: "Wishes", 
        subCategory: activeTab
      } 
    });
  };

  const filteredPosts = images.filter((post) => {
    const queryTerm = searchQuery.toLowerCase().trim();
    const postSubCategory = (post.subCategory || "").trim();
    const postLang = (post.language || post["language "] || "").toLowerCase().trim();

    // Language Filter
    const matchesLanguage = selectedLanguage === "all_lang" || postLang === selectedLanguage.toLowerCase();
    // Tab Filter
    const matchesTab = (activeTab === "All") || (postSubCategory.toLowerCase() === activeTab.toLowerCase());
    // Search Filter
    const matchesSearch = queryTerm === "" || (post.title || "").toLowerCase().includes(queryTerm);

    if (!matchesLanguage || !matchesTab || !matchesSearch) return false;

    let matchesMedia = true;
    const isPostVideo = isVideo(post.imageUrl);
    if (mediaFilter === "images_only") {
      matchesMedia = !isPostVideo;
    } else if (mediaFilter === "videos_only") {
      matchesMedia = isPostVideo;
    }

    return matchesMedia;
  });

  const wishTabs = ["All", "Birthday", "Anniversary", "Congratulation", "Get Well Soon", "Best of Luck", "Thank You", "Engagement", "Wedding", "New Job", "Miss You", "Sorry", "Safe Journey", "New Baby", "New Home", "New Vehicle", "Graduation"];

  return (
    <div className="cat-page-container10">

      <Navbar onSearch={(text) => setSearchQuery(text)} />
      
      <div className="cat-banner10">
        <div className="banner-content10"></div>
      </div>

      <div className="cat-filter-header10">
        <div className="left-side10">
          <img src={backArrow} alt="back" className="back-icon10" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
          <h3>Wishes Posts</h3>
        </div>

        <div className="right-side10">
          <div className="filter-controls10" onClick={(e) => {
    e.stopPropagation();
    setShowFilter((prev) => !prev);
  }}>
            <div className="filter-trigger10">
               <img src={menuIcon} alt="filter" className="vector-img-main10" />
            </div>

            <div className={`filter-dropdown10 ${showFilter ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
              {/* Language Option */}
              <div className="filter-item10">
                <label>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="all_lang">All Languages</option> 
                  <option value="marathi">Marathi</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
              </div>

              <div className="filter-item10">
                <label>Media Type</label>
                <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)}>
                  <option value="all_media">All (Images & Videos)</option>
                  <option value="images_only">Only Images</option>
                  <option value="videos_only">Only Videos</option>
                </select>
              </div>

              {/* Category Option */}
              <div className="filter-item10">
                <label>Category</label>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                   {wishTabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-container10">
        {wishTabs.map((tab) => (
          <button 
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="posts-grid10">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* Update the Static Post click handler */}
         <div 
                    className="post-card-vertical"
                    onClick={() => fileInputRef.current.click()}
                    style={{ 
                      width: '100%',
                      position: 'relative',
                      aspectRatio: '3 / 4',
                      overflow: 'hidden',
                      backgroundColor: '#1a1a1a', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #ca8b37'
                    }}
                  >
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                      <img src={create} alt="Create Custom" style={{ width: '32px', height: '32px', marginBottom: '8px' }} />
                      <span style={{ display: 'block', fontSize: '11px', color: '#ca8b37', fontWeight: 'bold' }}>Create Your Own</span>
                    </div>
                  </div>
        {loading ? (
          <p style={{ textAlign: "center", gridColumn: "1/-1", color: "white" }}>Loading...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const imageUrl = post.imageUrl;
            const isFavorite = favorites.includes(imageUrl);
            
            return (
              <div key={post.id} className="post-item10" style={{ position: 'relative' }}> 
          
                {isVideo(imageUrl) ? (
                  <video 
                    src={imageUrl}
                    className="grid-img10"
                    muted
                    playsInline
                    onClick={() => handleImageClick(post)}
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer', objectFit: 'cover' }}
                  />
                ) : (
                  <img 
                    src={post.thumbnailUrl || imageUrl}
                    alt={post.title || "Wishes Post"}
                    className="grid-img10"
                    style={{ width: "100%", borderRadius: "10px", display: "block", cursor: 'pointer' }}
                    loading="lazy"
                    onClick={() => handleImageClick(post)} 
                    onError={(e) => { e.target.src = 'https://placehold.jp/300x300.png'; }} 
                  />
                )}
   
                <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, imageUrl)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', zIndex: 2 }}>
                  <img src={isFavorite ? filledHeartIcon : vectorIcon} alt="heart" style={{ width: '24px', height: '24px' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-images-msg" style={{ gridColumn: "1/-1", textAlign: "center", color: "white" }}>
            No media found for this category...
          </p>
        )}
      </main>

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