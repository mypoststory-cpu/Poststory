// src/components/GradientBackground.jsx

import React from 'react';
import './styles/Welcome.css';

const GradientBackground = () => {
  return (
    <>

      <div className="center-animated-ring-wrapper">
        <div className="center-animated-ring"></div>
      </div>
  
      <div className="bottom-arc-container">
        <div className="bottom-arc-gradient"></div>
      </div>
    </>
  );
};

export default GradientBackground;