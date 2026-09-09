import React, { useState, useEffect, useRef } from "react";
import './styles/Home.css';
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, limit, orderBy, doc, updateDoc, where, increment, startAfter } from "firebase/firestore";
import { db } from "../firebaseConfig"; 

import vectorIcon from '../assets/Vector1.png';
import filledHeartIcon from '../assets/herat.png';
import backArrow from '../assets/lefta.png'; 
import next from "../assets/next.png"; 
import create from "../assets/upload.png" // Import your upload icon asset

// Category Icons
import catDaily from '../assets/Category/Daily.png';
import catDevotion from '../assets/Category/Devotion.png';
import catFestivals from '../assets/Category/Festivals.png';
import catWishes from '../assets/Category/Wishes.png';
import catThoughts from '../assets/Category/Thoughts.png';
import catFunny from '../assets/Category/Funny.png';
import catDays from '../assets/Category/Days.png';
import catPolitical from '../assets/Category/Updates.png';

const isVideo = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm');
};
const getIndianDateString = () => {
  const options = { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(new Date());
  
  const day = parts.find(p => p.type === 'day').value;
  const month = parts.find(p => p.type === 'month').value;
  
  return `${day}-${month}`; 
};

export default function Home() {
  const navigate = useNavigate();
  const [trendingList, setTrendingList] = useState([]);
  const [forYouList, setForYouList] = useState([]);
  const [todaysSpecial, setTodaysSpecial] = useState([]);
  
  // Instagram Feed States
  const [allPosts, setAllPosts] = useState([]); 
  const [loadingAllPosts, setLoadingAllPosts] = useState(false);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null); 
  const [hasMorePosts, setHasMorePosts] = useState(true);     
  
  // Feed Filter State ('all' | 'image' | 'video')
  const [feedFilter, setFeedFilter] = useState('all');

  const [selectedFullImage, setSelectedFullImage] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("user_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Reference for file upload input
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
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

  // Subscription Expiry Check
  useEffect(() => {
    const checkExpiry = () => {
      const savedUser = JSON.parse(localStorage.getItem("userData"));
      if (savedUser && savedUser.planExpiryDate) {
        const expiry = new Date(savedUser.planExpiryDate);
        const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 5 && diffDays > 0) {
          console.log(`Subscription ends in ${diffDays} days`);
        }
      }
    };
    checkExpiry();
  }, []);

  // 1. Fetch Trending Updates
  useEffect(() => {
    const fetchTrendingImages = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const q = query(
          collection(db, "postimg"), 
          where("category", "==", "Political"), 
          where("createdAt", ">=", thirtyDaysAgo), 
          orderBy("createdAt", "desc"),            
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const latestImages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrendingList(latestImages);
      } catch (error) {
        console.error("Home trending fetch error:", error);
      }
    };
    fetchTrendingImages();
  }, []);

  // 2. Load "For You" (Recently Viewed)
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      const savedRecentUrls = localStorage.getItem("recently_viewed");
      if (savedRecentUrls) {
        const urls = JSON.parse(savedRecentUrls);
        setForYouList(urls.slice(0, 10));
      }
    };
    loadRecentlyViewed();
  }, []);

  // 3. Fetch Today's Special
  useEffect(() => {
    const fetchDateSpecificImages = async () => {
      try {
        const todayString = getIndianDateString(); 

        const q = query(
          collection(db, "postimg"),
          where("eventDate", "==", todayString), 
          limit(15)
        );

        const querySnapshot = await getDocs(q);
        const specialImages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (specialImages.length === 0) {
          const fallbackQ = query(
            collection(db, "postimg"),
            orderBy("createdAt", "desc"),
            limit(10)
          );
          const fallbackSnap = await getDocs(fallbackQ);
          setTodaysSpecial(fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setTodaysSpecial(specialImages);
        }
      } catch (error) {
        console.error("Special fetch error:", error);
      }
    };
    fetchDateSpecificImages();
  }, []);      

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setLoadingAllPosts(true);
        const q = query(
          collection(db, "postimg"),
          orderBy("createdAt", "desc"), 
          limit(15)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          setLastVisibleDoc(lastVisible);
          
          const posts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAllPosts(posts);
        } else {
          setHasMorePosts(false);
        }
      } catch (error) {
        console.error("Error fetching initial categories posts:", error);
      } finally {
        setLoadingAllPosts(false);
      }
    };
    
    fetchInitialPosts();
  }, []);

  const fetchMorePosts = async () => {
    if (loadingAllPosts || !hasMorePosts || !lastVisibleDoc) return;

    try {
      setLoadingAllPosts(true);
      const nextQ = query(
        collection(db, "postimg"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisibleDoc), 
        limit(12)
      );

      const querySnapshot = await getDocs(nextQ);
      if (!querySnapshot.empty) {
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisibleDoc(lastVisible);

        const nextPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAllPosts((prev) => {
          const combined = [...prev, ...nextPosts];
          const uniquePosts = combined.filter((post, index, self) =>
            index === self.findIndex((p) => p.id === post.id)
          );
          return uniquePosts;
        });

      } else {
        setHasMorePosts(false); 
      }
    } catch (error) {
      console.error("Error loading more posts on scroll:", error);
    } finally {
      setLoadingAllPosts(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 150 
      ) {
        fetchMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastVisibleDoc, loadingAllPosts, hasMorePosts]);

  // Check Subscription from DB
  useEffect(() => {
    const checkSubscription = async () => {
      const savedUser = JSON.parse(localStorage.getItem("userData"));
      
      if (savedUser && savedUser.mobile) {
        try {
          const { getDoc, doc } = await import("firebase/firestore"); 
          const userRef = doc(db, "users", savedUser.mobile);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userDataFromDB = userSnap.data();
            
            if (userDataFromDB.planExpiryDate) {
              const expiry = new Date(userDataFromDB.planExpiryDate);
              const today = new Date();
              const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

              if (diffDays <= 5 && diffDays > 0 && !userDataFromDB.isNotificationSent) {
                alert(`Your Subscription ${diffDays} day ended!`);
                await updateDoc(userRef, { isNotificationSent: true });
              }
            }
          }
        } catch (err) {
          console.error("Subscription check error:", err);
        }
      }
    };
    checkSubscription();
  }, []);

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

  const handleImageClick = async (postOrUrl) => {
    const imageUrl = typeof postOrUrl === 'string' ? postOrUrl : postOrUrl.imageUrl;
    setSelectedFullImage(imageUrl);

    const savedRecent = localStorage.getItem("recently_viewed");
    let recentArray = savedRecent ? JSON.parse(savedRecent) : [];
    recentArray = [imageUrl, ...recentArray.filter(img => img !== imageUrl)];
    localStorage.setItem("recently_viewed", JSON.stringify(recentArray.slice(0, 20)));
    setForYouList(recentArray.slice(0, 10)); 

    if (postOrUrl.id) {
      try {
        const postRef = doc(db, "postimg", postOrUrl.id);
        await updateDoc(postRef, { clickCount: increment(1) });
      } catch (error) {
        console.error("Click sync error:", error);
      }
    }
  };

  const navigateImage = (direction) => {
    const combinedList = [...trendingList, ...allPosts];
    const imageUrls = [...new Set(combinedList.map(img => img.imageUrl))]; 
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
        categoryName: "Home"
      } 
    });
  };

  const categoryList = [
    { name: "Daily", img: catDaily },
    { name: "Devotional", img: catDevotion },
    { name: "Festivals", img: catFestivals },
    { name: "Wishes", img: catWishes },
    { name: "Thoughts", img: catThoughts },
    { name: "Funny", img: catFunny },
    { name: "Days", img: catDays },
    { name: "Political", img: catPolitical },
  ];

  // Filtered posts based on selected filter state
  const filteredPosts = allPosts.filter(post => {
    if (feedFilter === 'image') return !isVideo(post.imageUrl);
    if (feedFilter === 'video') return isVideo(post.imageUrl);
    return true; // 'all'
  });

  return (
    <div className="home-container">
      <Navbar />
      <main>
        <section className="banner"></section>
        {/* AI Image Generator Banner Box */}
        <section className="section" style={{  marginTop: '15px' }}>
          <div 
            onClick={() => navigate("/ai-generator")}
            style={{
              background: 'linear-gradient(135deg, #2b1d0c 0%, #ca8b37 100%)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(202, 139, 55, 0.3)',
              border: '1px solid rgba(202, 139, 55, 0.4)'
            }}
          >
            <div>
              <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 5px 0', fontWeight: 'bold' }}>
                ✨ AI Image Generator
              </h4>
              <p style={{ color: '#ddd', fontSize: '12px', margin: 0 }}>
                Type your thoughts and turn them into stunning images instantly!
              </p>
            </div>
            <div style={{
              background: '#000',
              color: '#ca8b37',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}>
              Try Now
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="section">
          <div className="section-header">
            <h3>Trending Updates</h3>
            <span onClick={() => navigate("/trending")} style={{cursor: 'pointer'}}>Show All</span>
          </div>
          <div className="card-row">
            {trendingList.length > 0 ? (
              trendingList.map((post) => (
                <div key={post.id} className="post-card">
                  {isVideo(post.imageUrl) ? (
                    <video
                      src={`${post.imageUrl}#t=0.001`} 
                      className="card-img-full"
                      muted
                      preload="metadata" 
                      playsInline 
                      onClick={() => handleImageClick(post)}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  ) : (
                    <img
                      src={post.thumbnailUrl || post.imageUrl}
                      className="card-img-full"
                      alt="trending"
                      onClick={() => handleImageClick(post)}
                    />
                  )}
                  <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, post.imageUrl)}>
                    <img src={favorites.includes(post.imageUrl) ? filledHeartIcon : vectorIcon} alt="heart" />
                  </div>
                </div>
              ))
            ) : (
              <p className="loading-text">Finding viral updates...</p>
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
            <h3>For You</h3>
            <span onClick={() => navigate("/foru")} style={{ cursor: 'pointer' }}>Show All</span>
          </div>
          <div className="card-row">
            {forYouList.length > 0 ? (
              forYouList.map((imgUrl, index) => (
                <div key={index} className="post-card">
                  {isVideo(imgUrl) ? (
                    <video
                      src={`${imgUrl}#t=0.001`} 
                      className="card-img-full"
                      muted
                      preload="metadata"
                      playsInline
                      onClick={() => handleImageClick(imgUrl)}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  ) : (
                    <img
                      src={imgUrl}
                      className="card-img-full"
                      alt="recently viewed"
                      onClick={() => handleImageClick(imgUrl)}
                    />
                  )}
                  <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, imgUrl)}>
                    <img src={favorites.includes(imgUrl) ? filledHeartIcon : vectorIcon} alt="heart" />
                  </div>
                </div>
              ))
            ) : (
              <p className="loading-text">View some posts to see them here!</p>
            )}
          </div>
        </section>

        {/* Today's Special Section */}
        <section className="section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="header-left">
              <h3>Today's Special</h3>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <span className="view-all-link" onClick={() => navigate("/special")} style={{ cursor: 'pointer' }}>
              View All
            </span>
          </div>

          <div className="card-row">
            {todaysSpecial.length > 0 ? (
              todaysSpecial.map((post) => (
                <div key={post.id} className="post-card">
                  {isVideo(post.imageUrl) ? (
                    <video
                      src={`${post.imageUrl}#t=0.001`}
                      className="card-img-full"
                      muted
                      preload="metadata"
                      playsInline
                      onClick={() => handleImageClick(post)}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  ) : (
                    <img
                      src={post.thumbnailUrl || post.imageUrl}
                      className="card-img-full"
                      alt="special"
                      onClick={() => handleImageClick(post)}
                    />
                  )}
                  <div className="fav-icon-overlay" onClick={(e) => toggleFavorite(e, post.imageUrl)}>
                    <img src={favorites.includes(post.imageUrl) ? filledHeartIcon : vectorIcon} alt="heart" />
                  </div>
                </div>
              ))
            ) : (
              <p className="loading-text">Finding today's events...</p>
            )}
          </div>
        </section>

        {/* INSTAGRAM STYLE FEED WITH FILTERS */}
        <section className="section instagram-feed-section" style={{ marginTop: '30px', padding: '0 1px' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', margin: 0 }}>Explore More Posts</h3>
            
            {/* Filter Buttons on the Right Side */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setFeedFilter('all')}
                style={{
                  background: feedFilter === 'all' ? '#ca8b37' : '#222',
                  color: feedFilter === 'all' ? '#000' : '#aaa',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                All
              </button>
              <button 
                onClick={() => setFeedFilter('image')}
                style={{
                  background: feedFilter === 'image' ? '#ca8b37' : '#222',
                  color: feedFilter === 'image' ? '#000' : '#aaa',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Images only
              </button>
              <button 
                onClick={() => setFeedFilter('video')}
                style={{
                  background: feedFilter === 'video' ? '#ca8b37' : '#222',
                  color: feedFilter === 'video' ? '#000' : '#aaa',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Video only
              </button>
            </div>
          </div>
          
          {/* Hidden file input for custom image uploads */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          {/* Grid Layout - 3 Vertical Columns */}
          <div className="instagram-feed-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '8px', 
            padding: '5px 0' 
          }}>
            {/* Static User-Owned Image Upload Card */}
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

            {filteredPosts.map((post, index) => ( 
              <div 
                key={`${post.id}-${index}`} 
                className="post-card-vertical"
                style={{ 
                  width: '100%',
                  position: 'relative',
                  aspectRatio: '3 / 4',
                  overflow: 'hidden',
                  backgroundColor: '#1a1a1a', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)' 
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  {isVideo(post.imageUrl) ? (
                    <video
                      src={`${post.imageUrl}#t=0.001`}
                      muted
                      preload="metadata"
                      playsInline
                      onClick={() => handleImageClick(post)}
                      style={{ objectFit: 'cover', height: '100%', width: '100%', cursor: 'pointer', display: 'block' }} 
                    />
                  ) : (
                    <img
                      src={post.thumbnailUrl || post.imageUrl}
                      alt={post.category || "feed post"}
                      onClick={() => handleImageClick(post)}
                      style={{ objectFit: 'cover', height: '100%', width: '100%', cursor: 'pointer', display: 'block' }} 
                    />
                  )}
                  
                  {/* Like Icon Overlay - Bottom Right */}
                  <div className="fav-icon-overlay" 
                       onClick={(e) => toggleFavorite(e, post.imageUrl)}
                       style={{ 
                         position: 'absolute', 
                         bottom: '10px', 
                         right: '10px', 
                         zIndex: 2,
                         background: 'rgba(0, 0, 0, 0.4)', 
                         padding: '6px',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center'
                       }}>
                    <img 
                      src={favorites.includes(post.imageUrl) ? filledHeartIcon : vectorIcon} 
                      alt="heart" 
                      style={{ width: '16px', height: '16px' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading status bar */}
          {loadingAllPosts && (
            <p style={{ textAlign: 'center', padding: '15px', color: '#666', fontSize: '14px' }}>Loading more posts...</p>
          )}
          {!hasMorePosts && allPosts.length > 0 && (
            <p style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '13px' }}>✔ You've seen all posts</p>
          )}
        </section>
      </main>

      {/* Modal Section */}
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
                  <img src={selectedFullImage} alt="Preview" className="full-view-img" />
                )}
                <div className="modal-fav-icon-overlay" onClick={(e) => toggleFavorite(e, selectedFullImage)}>
                  <img src={favorites.includes(selectedFullImage) ? filledHeartIcon : vectorIcon} alt="heart" />
                </div>
              </div>
              <div className="modal-nav-arrow right" onClick={() => navigateImage("next")}>
                <img src={next} alt="next" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
            <div className="modal-footer-action">
              <button className="continue-btn" onClick={handleNextToEdit}>
                Continue <img src={backArrow} alt="next" className="btn-arrow" style={{transform: 'rotate(180deg)'}} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}