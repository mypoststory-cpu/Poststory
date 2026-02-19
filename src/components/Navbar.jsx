import React, { useState, useEffect } from "react";
import './styles/Navbar.css';
import { useNavigate } from "react-router-dom";
import searchIcon from "../../src/assets/Home/1.png";
import heartIcon from "../../src/assets/Home/2.png";
import menuIcon from "../../src/assets/Home/3.png";
import defaultProfileImg from "../../src/assets/2.png";

export default function Navbar({ onSearch }) { 
  const [isSearching, setIsSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
 const [searchTerm, setSearchTerm] = useState(""); 

  const [userData, setUserData] = useState({ name: "Guest", profileImg: null });

 const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  if (value.trim().length > 0) {
      navigate(`/search?q=${value}`);
    }
    
    if (onSearch) onSearch(value);
  };
  const handleLogout = () => {
  localStorage.removeItem("userData");
  setIsMenuOpen(false);
 navigate("/login");
 };


 useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("userData"));
    if (savedData) {
      setUserData({
        name: savedData.name || "Guest",
        profileImg: savedData.profileImage || null 
      });
    }
  }, []);
const goToHome = () => {
  navigate("/home");
};
  const defaultProfile = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <>

      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="side-menu" onClick={(e) => e.stopPropagation()}>
            <div className="menu-close-header">
              <span className="close-x" onClick={() => setIsMenuOpen(false)}>✕</span>
            </div>
            
       
            <div className="menu-profile-section">
             
              
            </div>

            <ul className="menu-list">
              <li onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}>Profile</li>
              <li onClick={()=> {navigate("/SignatureSelection"); setIsMenuOpen(false);}}>Signature</li>
              
       
              <li onClick={() => { navigate("/subscription"); setIsMenuOpen(false); }}>Buy Plan</li>
               <li onClick={() => { navigate("/history"); setIsMenuOpen(false); }}>History</li>
              <li onClick={() => {navigate("/helpfeedback"); setIsMenuOpen(false); }}>Help & Feedback</li>
              <li onClick={() => {navigate("/privacypolicy"); setIsMenuOpen(false);}}>Privacy Policy</li>
              <li onClick={() => {navigate("/termsofservice"); setIsMenuOpen(false);}}>Terms and Services</li>
              <li onClick={() => {navigate("/mysubscription"); setIsMenuOpen(false);}}>My Subscription </li>
                     <li className="logout-btn" onClick={handleLogout}>Logout</li>
            </ul>
          </div>
        </div>
      )}

    
    <header className="top-header">
    
     <div className="profile" onClick={goToHome} style={{ cursor: "pointer" }}>
          <div className="profile-ring">
            <div className="rotating-logo"></div>
            <img 
              src={userData.profileImg || defaultProfileImg} 
              alt="profile" 
              className="profile-img" 
              style={{ filter: "none" }}
            />
          </div>
        </div>

    
        {isSearching ? (
          <div className="search-bar-active">
           <input 
  type="text" 
  placeholder="Search..." 
  autoFocus 
  value={searchTerm} 
  onChange={handleSearch} 
/>
            <span className="close-btn-small" onClick={() => {
                setIsSearching(false);
                onSearch && onSearch(""); 
            }}>✕</span>
          </div>
        ) : (
          <div className="header-text-static">
             <span>Hello</span>
           <h3>{userData.name}</h3>
          </div>
        )}

       
        <div className="icons">
          <img 
            src={searchIcon} 
            alt="search" 
            className="icon-img" 
            onClick={() => setIsSearching(!isSearching)} 
          />
          <img 
            src={heartIcon} 
            alt="favorites" 
            className="icon-imgf" 
            onClick={() => navigate("/favorites")} 
          />
          <img 
            src={menuIcon} 
            alt="menu" 
            className="icon-img" 
            onClick={() => setIsMenuOpen(true)} 
          />
        </div>
      </header>
    </>
  );
}