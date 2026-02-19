// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // OTP साठी
import { getFirestore } from "firebase/firestore"; // डेटा सेव्ह करण्यासाठी

const firebaseConfig = {
  apiKey: "AIzaSyD2QbJBoPTAulu9e7OLXXxDSqIIKYOZ2JE",
  authDomain: "allezpoststory.firebaseapp.com",
  projectId: "allezpoststory",
  storageBucket: "allezpoststory.firebasestorage.app",
  messagingSenderId: "882147774912",
  appId: "1:882147774912:web:e4aed7dfc666121c4bb825",
  measurementId: "G-PSDB8XR7NJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// या दोन ओळी सर्वात महत्त्वाच्या आहेत, त्याशिवाय Login/Registration चालणार नाही
export const auth = getAuth(app); 
export const db = getFirestore(app); 

export default app;