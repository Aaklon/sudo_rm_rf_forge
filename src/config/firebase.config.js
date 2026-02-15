const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

// Firebase Client SDK Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase Client SDK
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Initialize Firebase Admin SDK
let adminInitialized = false;
try {
  const serviceAccount = require(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "../../serviceAccountKey.json",
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  adminInitialized = true;
  console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  console.warn("⚠️  Firebase Admin SDK initialization failed:", error.message);
  console.warn("⚠️  Admin features will be disabled");
}

module.exports = {
  auth,
  admin: adminInitialized ? admin : null,
  firebaseApp,
};
