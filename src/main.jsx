import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Firebase App Check डिबग टोकन चालू करा (फक्त डेव्हलपमेंटसाठी)
if (window && !window.location.hostname.includes('firebaseapp.com')) {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);