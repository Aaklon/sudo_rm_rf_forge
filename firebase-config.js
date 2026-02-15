// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyChRrrBOv87yVooPTQgZopzUXpusatr7bE",
  authDomain: "bookmylibrary-67aef.firebaseapp.com",
  projectId: "bookmylibrary-67aef",
  storageBucket: "bookmylibrary-67aef.firebasestorage.app",
  messagingSenderId: "632586124007",
  appId: "1:632586124007:web:fdee57d62b797789004042",
};

// Initialize Firebase
let app, auth, db, storage;

function initializeFirebase() {
  try {
    // Initialize Firebase App
    app = firebase.initializeApp(firebaseConfig);

    // Initialize services and assign to global Firebase object
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage().ref();

    // Update the global Firebase object
    window.Firebase.auth = auth;
    window.Firebase.db = db;
    window.Firebase.storage = storage;
    window.Firebase.app = app;

    // Enable offline persistence
    db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Persistence failed: Multiple tabs open");
      } else if (err.code === "unimplemented") {
        console.warn("Persistence not available in this browser");
      }
    });

    console.log("✅ Firebase initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    return false;
  }
}

// Connection state monitoring
function monitorConnection() {
  const connectedRef = db.collection(".info/connected");
  connectedRef.onSnapshot((snapshot) => {
    if (snapshot.exists()) {
      console.log("🟢 Connected to Firestore");
      window.dispatchEvent(new CustomEvent("firebase:connected"));
    } else {
      console.log("🔴 Disconnected from Firestore");
      window.dispatchEvent(new CustomEvent("firebase:disconnected"));
    }
  });
}

// Export Firebase instances
window.Firebase = {
  app,
  auth,
  db,
  storage,
  initialize: initializeFirebase,
  monitorConnection,

  // Firestore helpers
  timestamp: firebase.firestore.FieldValue.serverTimestamp,
  increment: (value) => firebase.firestore.FieldValue.increment(value),
  arrayUnion: (...elements) =>
    firebase.firestore.FieldValue.arrayUnion(...elements),
  arrayRemove: (...elements) =>
    firebase.firestore.FieldValue.arrayRemove(...elements),

  // Common collections
  collections: {
    users: () => db.collection("users"),
    seats: () => db.collection("seats"),
    bookings: () => db.collection("bookings"),
    penalties: () => db.collection("penalties"),
    notifications: () => db.collection("notifications"),
    qrCodes: () => db.collection("qr_codes"),
    config: () => db.collection("library_config"),
    attendance: () => db.collection("attendance"),
    libraryConfig: () => db.collection("libraryConfig"),
  },
};
