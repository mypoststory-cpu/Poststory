// src/components/SplashContent.jsx
import React, { useState, useEffect } from 'react';
import './styles/Welcome.css'; 

const contentList = [
  { highlight: "faster" },        
  { highlight: "with ease" },  
  { highlight: "efficiently" }, 
];

const SplashContent = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
 
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % contentList.length);
    }, 3000); 

    return () => clearInterval(intervalId);
  }, []); 

  const currentContent = contentList[currentIndex];

  return (
    <div className="content-container">
      <div 
        className="heading" 
        key={currentIndex} 
      >
        Manage your
        <br />
        <span className="gradient-text">#PostStory</span>
        <br />
        
        <span className="bold-word fade-in-out">{currentContent.highlight}</span>
      </div>
    </div>
  );
};

export default SplashContent;