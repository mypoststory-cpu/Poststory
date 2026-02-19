import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../styles/HelpFeedback.css";
import backArrow from "../../assets/lefta.png";

export default function HelpFeedback() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
   
    alert("Thank you for your feedback!");
    navigate(-1);
  };

  return (
    <div className="help-container">
      <Navbar />

      <div className="help-header-nav">
        <img 
          src={backArrow} 
          alt="back" 
          className="back-btn" 
          onClick={() => navigate(-1)} 
        />
        <h3>Help & Feedback</h3>
      </div>

      <div className="help-content">
   
        <section className="support-card">
          <h2>Have a question?</h2>
          <p>We are here to help!</p>
          <div className="contact-info">
            <p><strong>Email Us:</strong> <span className="gold-text">mypoststory@gmail.com</span></p>
            <p className="tip">💡 Tip: We usually reply within 24 hours.</p>
          </div>
        </section>

        <section className="feedback-form-section">
          <h2>Share Your Suggestions</h2>
          <p className="subtitle">Help us make Post Story better for you.</p>

          <form onSubmit={handleSubmit}>
    
            <div className="rating-area">
              <p>How would you rate your experience?</p>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={rating >= star ? "star active" : "star"}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

         
            <div className="input-group">
              <label>What would you like  to do?</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                required
                className="styled-select"
              >
                <option value="" disabled>Select an option</option>
                <option value="template">Suggest a New Template</option>
                <option value="bug">Report a Problem / Bug</option>
                <option value="feature">Request a New Feature</option>
                <option value="general">General Feedback</option>
              </select>
            </div>

         
            <div className="input-group">
              <label>Tell us more:</label>
              <textarea 
                placeholder="Describe your suggestion or problem here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                className="styled-textarea-v2"
              />
            </div>

          
            <div className="input-group">
              <label>Your Name (Optional):</label>
              <input 
                type="text" 
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="styled-input-v2"
              />
            </div>

            <button type="submit" className="submit-btn">Send Feedback</button>
          </form>
        </section>
      </div>
    </div>
  );
}