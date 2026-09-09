import React, { useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { FirebaseAppCheck } from '@capacitor-firebase/app-check';
import { doc, getDoc } from "firebase/firestore"; 
import { db } from "./firebaseConfig";

import SplashContent from "./components/SplashContent";
import GradientBackground from "./components/GradientBackground";
import ContinueButton from "./components/ContinueButton";
import Login from "./components/Login";
import Registration from "./components/Registration";
import Home from"./components/Home";
import Favorites  from "./components/Favorites";
import DailyPage from "./components/pages/DailyPage";
import DevotionPage from"./components/pages/DevotionPage";
import Festivals from "./components/pages/Festivals";
import Wishes from "./components/pages/Wishes";
import Thoughts from "./components/pages/Thoughts";
import Funny from"./components/pages/Funny";
import Days from"./components/pages/Days";
import Political from"./components/pages/Political";
import Trending from"./components/pages/Trending";
import Foru from"./components/pages/Foru";
import PostSelection from "./components/pages/PostSelection";
import ProfilePage from "./components/pages/ProfilePage";
import HistoryPage from "./components/pages/HistoryPage";
import TodaysSpecial from "./components/pages/TodaysSpecial";
import Subscription from "./components/pages/Subscription";
import InstallApp from "./components/InstallApp";
import SearchPage from "./components/pages/SearchPage";
import SignatureSelection from"./components/pages/SignatureSelection";
import TermsOfService from "./components/pages/TermsOfService";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import HelpFeedback from "./components/pages/HelpFeedback";
import MySubscription from "./components/pages/MySubscription";
import VideoProcessor from "./components/VideoProcessor";
import AIGenerator from "./components/pages/AIGenerator";


const CURRENT_APP_VERSION = "1.0.1"; 

const isLoggedIn = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  
  useEffect(() => {

    const initAppCheck = async () => {
      try {
        await FirebaseAppCheck.initialize({
          providerFactory: 'playIntegrity', 
          isTokenAutoRefreshEnabled: true,
        });
        console.log("App Check Native Integrity Mode Initialized ✅");
      } catch (error) {
        console.warn("App Check Dev Bypass Enabled. ReCAPTCHA completely blocked.");
      }
    };

   
    const autoUpdateVersionCheck = async () => {
      try {
   
        const versionRef = doc(db, "app_settings", "version_control");
        const docSnap = await getDoc(versionRef);
        
        if (docSnap.exists()) {
          const latestServerVersion = docSnap.data().current_version; // exm. "1.0.2"
          
        
          if (CURRENT_APP_VERSION !== latestServerVersion) {
            console.log("New Version Update! Wait Cache Clean...");
            
         
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
              );
            }


            window.location.reload(true);
          }
        }
      } catch (error) {
        console.error("Auto update checking failed:", error);
      }
    };

    initAppCheck();
    autoUpdateVersionCheck();
  }, []);

  return (
    <>
      <Routes>
        {/* Welcome Page */}
        <Route 
          path="/" 
          element={isLoggedIn() ? <Navigate to="/home" replace /> : <Welcome />} 
        />
        <Route 
          path="/login" 
          element={isLoggedIn() ? <Navigate to="/home" replace /> : <Login />} 
        />
        <Route path="/registration" element={<Registration/>} />
        
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/category/daily" element={<ProtectedRoute><DailyPage /></ProtectedRoute>} />
        <Route path="/category/devotional" element={<ProtectedRoute> <DevotionPage/></ProtectedRoute>}/>
        <Route path="/category/festivals" element={<ProtectedRoute><Festivals/></ProtectedRoute>} />
        <Route path="/category/wishes" element={<ProtectedRoute><Wishes/></ProtectedRoute>} /> 
        <Route path="/category/thoughts" element={<ProtectedRoute><Thoughts/> </ProtectedRoute>} />
        <Route path="/category/funny" element={<ProtectedRoute><Funny/></ProtectedRoute>} />
        <Route path="/category/days" element={<ProtectedRoute><Days/></ProtectedRoute> } />
      <Route path="/category/political" element={<ProtectedRoute><Political/></ProtectedRoute>}/>
        <Route path="/trending" element={<ProtectedRoute><Trending/></ProtectedRoute>} />
        <Route path="/foru" element={<ProtectedRoute><Foru/> </ProtectedRoute>} />
        <Route path="/post-selection" element={<ProtectedRoute> <PostSelection /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/special" element={<ProtectedRoute><TodaysSpecial></TodaysSpecial></ProtectedRoute>}/>
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/signatureselection" element={<ProtectedRoute><SignatureSelection/> </ProtectedRoute>}/>
        <Route path="/videoprocessor" element={<ProtectedRoute><VideoProcessor /></ProtectedRoute>}/>
        <Route path="/termsofservice" element={<ProtectedRoute><TermsOfService/></ProtectedRoute>} />
        <Route path="/privacypolicy" element={<ProtectedRoute><PrivacyPolicy/></ProtectedRoute>} />
        <Route path="/helpfeedback" element={<ProtectedRoute><HelpFeedback/></ProtectedRoute>} />
        <Route path="/mysubscription" element={<ProtectedRoute><MySubscription/></ProtectedRoute>} />
        <Route path="/ai-generator" element={<ProtectedRoute>{<AIGenerator />}</ProtectedRoute>} />
      </Routes>
      <InstallApp />  
    </>
  );
}

function Welcome() {
  const navigate = useNavigate();

  const handleContinue = () => {
    console.log("Continue clicked");
    navigate("/login");
  };

  return (
    <>
      <GradientBackground />
      <SplashContent />
      <ContinueButton onClick={handleContinue} />
    </>
  );
}