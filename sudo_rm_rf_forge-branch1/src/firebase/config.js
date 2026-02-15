import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChRrrBOv87yVooPTQgZopzUXpusatr7bE",
  authDomain: "bookmylibrary-67aef.firebaseapp.com",
  projectId: "bookmylibrary-67aef",
  storageBucket: "bookmylibrary-67aef.firebasestorage.app",
  messagingSenderId: "632586124007",
  appId: "1:632586124007:web:fdee57d62b797789004042",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
