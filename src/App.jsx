import React from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

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
import wishes from "./components/pages/Wishes";
import Wishes from "./components/pages/Wishes";
import Thoughts from "./components/pages/Thoughts";
import Funny from"./components/pages/Funny";
import Days from"./components/pages/Days";
import Updates from"./components/pages/Updates";
import Trending from"./components/pages/Trending";
import Foru from"./components/pages/Foru";
import PostSelection from "./components/pages/PostSelection";
import ProfilePage from "./components/pages/ProfilePage";
import HistoryPage from "./components/pages/HistoryPage";

import Subscription from "./components/pages/Subscription";
import InstallApp from "./components/InstallApp";
import SearchPage from "./components/pages/SearchPage";
import SignatureSelection from"./components/pages/SignatureSelection";
import TermsOfService from "./components/pages/TermsOfService";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import HelpFeedback from "./components/pages/HelpFeedback";
import MySubscription from "./components/pages/MySubscription";
import AdminBulkUpload from "./admin/AdminBulkUpload";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLogin from "./admin/AdminLogin";
import AdminRoute from "./admin/AdminRoute";
import AdminUpload from "./admin/AdminUpload";


export default function App() {
  return (
    <>
    <Routes>
<Route path="/admin/login" element={<AdminLogin />} />

<Route
 path="/admin/dashboard"
 element={
   <AdminRoute>
     <AdminDashboard />
   </AdminRoute>
 }
/>

<Route
 path="/admin/upload"
 element={
   <AdminRoute>
     <AdminUpload />
   </AdminRoute>
 }
/>
<Route
  path="/admin/bulk-upload"
  element={
    <AdminRoute>
      <AdminBulkUpload />
    </AdminRoute>
  }
/>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
    <Route path="/registration" element={<Registration/>} />
    <Route path="/home" element={<Home/>}/>
    <Route path="/favorites" element={<Favorites/>}/>
   <Route path="/category/daily" element={<DailyPage />} />
   <Route path="/category/devotion" element={<DevotionPage/>}/>
   <Route path="/category/festivals" element={<Festivals/>} />
   <Route path="/category/wishes" element={<Wishes/>} /> 
   <Route path="/category/thoughts" element={<Thoughts/>} />
    <Route path="/category/funny" element={<Funny/>} />
    <Route path="/category/days" element={<Days/>} />
    <Route path="/category/updates" element={<Updates/>} />
    <Route path="/trending" element={<Trending/>} />
    <Route path="/foru" element={<Foru/>} />
   <Route path="/post-selection" element={<PostSelection />} />
   <Route path="/profile" element={<ProfilePage />} />
  <Route path="/history" element={<HistoryPage />} />

<Route path="/subscription" element={<Subscription />} />
<Route path="/search" element={<SearchPage />} />
<Route path="/signatureselection" element={<SignatureSelection/>}/>
<Route path="/admin-upload" element={<AdminUpload />} />
<Route path="/termsofservice" element={<TermsOfService/>} />
<Route path="/privacypolicy" element={<PrivacyPolicy/>} />
<Route path="/helpfeedback" element={<HelpFeedback/>} />
<Route path="/mysubscription" element={<MySubscription/>} />
<Route path="/admin-bulk-upload" element={<AdminBulkUpload />} />


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
