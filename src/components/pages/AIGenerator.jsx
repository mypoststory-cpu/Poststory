import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../Navbar';
import backArrow from '../../assets/lefta.png';
import '../styles/Home.css';

export default function AIGenerator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'mr-IN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setPrompt((prev) => {
        const updated = prev ? prev + ' ' + speechText : speechText;
        return updated;
      });
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setError('Voice recognition failed. Please allow microphone permission.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt or instruction for the image.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedImageUrl('');
    
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('width', '1080');
      formData.append('height', '1350');

      // ⚠️ IMPORTANT FOR APK: Replace 'https://your-backend-url.onrender.com' with your actual live backend URL
 const response = await fetch("https://post-story-backend-1.onrender.com/generate-image", {
  method: 'POST',
  body: formData,
});
      if (!response.ok) {
        throw new Error('Failed to communicate with the backend server.');
      }

      const data = await response.json();
      
      if (!data.imageUrl) {
        throw new Error("No image URL returned from backend server.");
      }

      setGeneratedImageUrl(data.imageUrl);
      
    } catch (err) {
      console.error("Backend Error:", err);
      setError('Failed to process image generation. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToEdit = () => {
    navigate("/post-selection", { 
      state: { 
        postImg: generatedImageUrl, 
        categoryName: "AI Edited",
        initialCustomText: "" 
      } 
    });
  };

  return (
    <div className="home-container" style={{ minHeight: '100vh', background: '#121212', color: '#fff' }}>
      <Navbar />
      
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #ca8b37', borderTop: '1px solid #ca8b37', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src={backArrow} alt="back" style={{ width: '24px', height: '15px' }} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#fafafa' }}>✨ AI Image Studio</h2>
        </div>

        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingTop: '20px' }}>
          
          <div style={{ position: 'relative' }}>
            <textarea
              rows="4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Type prompt e.g., Beautiful sunrise background, text: "Good Morning"'
              style={{ 
                width: '100%', 
                padding: '12px', 
                paddingBottom: '45px', 
                borderRadius: '12px', 
                background: '#1a1a1a', 
                border: '1px solid #333', 
                color: '#fff', 
                outline: 'none', 
                boxSizing: 'border-box',
                resize: 'none'
              }}
            />
            
            
          </div>

          {error && <p style={{ color: '#ff4d4d', fontSize: '12px' }}>{error}</p>}
          
          <button type="submit" disabled={loading} style={{ background: loading ? '#555' : 'linear-gradient(135deg, #2b1d0c 0%, #ca8b37 100%)', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>
            {loading ? 'Generating...' : 'Generate with Cloud AI 🚀'}
          </button>
        </form>

        {generatedImageUrl && (
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <img src={generatedImageUrl} alt="AI Result" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '16px', display: 'block' }} />
            </div>

            <button
              style={{ marginTop: '15px', width: '100%', background: '#222', color: '#ca8b37', border: '1px solid #ca8b37', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={handleContinueToEdit}
            >
              Continue to Edit & Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}