import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2QbJBoPTAulu9e7OLXXxDSqIIKYOZ2JE",
  authDomain: "allezpoststory.firebaseapp.com",
  projectId: "allezpoststory",
  storageBucket: "allezpoststory.firebasestorage.app",
  messagingSenderId: "882147774912",
  appId: "1:882147774912:web:e4aed7dfc666121c4bb825",
  measurementId: "G-PSDB8XR7NJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;