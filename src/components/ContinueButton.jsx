import React from "react";
import "./styles/Welcome.css";
import arrowImg from "../../src/assets/Arrow.png";

const ContinueButton = ({ onClick }) => {
  return (
    <button
      className="continue-button"
      onClick={onClick}
      type="button"
    >
      Continue <img 
        src={arrowImg} 
        alt="arrow" 
        className="arrow-icon-img" 
      />
    </button>
  );
};

export default ContinueButton;