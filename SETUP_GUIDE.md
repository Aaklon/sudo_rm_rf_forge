# BookMySeat React - Complete Setup Guide

## 📦 What's Included

This is a complete conversion of your HTML BookMySeat project to React. The project structure follows React best practices with:

- **Context-based state management** for auth and theme
- **Firebase integration** for backend services
- **Reusable components** for better maintainability
- **Responsive design** that works on all devices
- **Protected routes** for authenticated pages

## 🏗️ Project Structure

```
bookmyseat-react/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── Navbar.js           # Navigation bar component
│   │   └── ProtectedRoute.js   # Route protection wrapper
│   ├── contexts/
│   │   ├── AuthContext.js      # Authentication state management
│   │   └── ThemeContext.js     # Theme switching (dark/light)
│   ├── firebase/
│   │   └── config.js           # Firebase configuration
│   ├── pages/
│   │   ├── Home.js             # Landing page
│   │   ├── Auth.js             # Login/Register page
│   │   ├── Dashboard.js        # Main booking interface
│   │   ├── Profile.js          # User profile (stub)
│   │   ├── Leaderboard.js      # Rankings (stub)
│   │   └── InitDB.js           # Database initialization
│   ├── services/
│   │   ├── bookingService.js   # Booking operations
│   │   └── seatService.js      # Seat management
│   ├── styles/
│   │   └── global.css          # All styles
│   ├── App.js                  # Main app with routing
│   └── index.js                # Entry point
├── package.json
└── README.md
```

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd bookmyseat-react
npm install
```

This will install:
- React 18
- React Router DOM (for navigation)
- Firebase SDK (for backend)

### Step 2: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable the following services:
   - **Authentication**: Email/Password and Google Sign-In
   - **Firestore Database**: Start in test mode
   - **Storage**: Start in test mode

4. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the configuration object

5. Update `src/firebase/config.js`:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyChRrrBOv87yVooPTQgZopzUXpusatr7bE",
  authDomain: "bookmylibrary-67aef.firebaseapp.com",
  projectId: "bookmylibrary-67aef",
  storageBucket: "bookmylibrary-67aef.firebasestorage.app",
  messagingSenderId: "632586124007",
  appId: "1:632586124007:web:fdee57d62b797789004042",
};
```

### Step 3: Set Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /seats/{seatId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                             resource.data.userId == request.auth.uid;
    }
    
    match /config/{document} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 4: Start Development Server

```bash
npm start
```

The app will open at http://localhost:3000

### Step 5: Initialize Database

1. Navigate to http://localhost:3000/init-db
2. Click "Initialize Database"
3. Wait for completion (creates 50 seats and config)

### Step 6: Create Admin Account

1. Register at http://localhost:3000/auth
2. Go to Firebase Console → Authentication → Users
3. Find your user, copy the UID
4. Go to Firestore → users → [your-uid]
5. Edit document: change `role: "student"` to `role: "admin"`
6. Refresh and you're an admin!

## 📝 Key Differences from HTML Version

### 1. **Component-Based Architecture**

**HTML Version:**
```html
<nav class="navbar">...</nav>
<!-- Repeated on every page -->
```

**React Version:**
```jsx
import Navbar from '../components/Navbar';

function Dashboard() {
  return <Navbar isAuthenticated={true} />;
}
```

### 2. **State Management with Context**

**HTML Version:**
```javascript
// localStorage everywhere
const user = JSON.parse(localStorage.getItem('user'));
```

**React Version:**
```jsx
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  // currentUser and userProfile available everywhere!
}
```

### 3. **Real-Time Updates**

**HTML Version:**
```javascript
// Manual polling
setInterval(() => fetchSeats(), 5000);
```

**React Version:**
```jsx
useEffect(() => {
  const unsubscribe = seatService.listenToSeats((seats) => {
    setSeats(seats); // Auto-updates when data changes!
  });
  return () => unsubscribe();
}, []);
```

### 4. **Routing**

**HTML Version:**
```html
<a href="dashboard.html">Dashboard</a>
<!-- Page reload on every navigation -->
```

**React Version:**
```jsx
import { Link } from 'react-router-dom';
<Link to="/dashboard">Dashboard</Link>
// Instant navigation, no page reload!
```

## 🔧 Common Tasks

### Adding a New Page

1. Create file in `src/pages/`:
```jsx
// src/pages/NewPage.js
import React from 'react';
import Navbar from '../components/Navbar';

function NewPage() {
  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="container" style={{ paddingTop: '120px' }}>
        <h1>New Page</h1>
      </div>
    </>
  );
}

export default NewPage;
```

2. Add route in `src/App.js`:
```jsx
import NewPage from './pages/NewPage';

// Inside <Routes>:
<Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

### Adding a New Service Function

1. Edit service file (e.g., `src/services/bookingService.js`):
```javascript
async myNewFunction() {
  // Your Firebase logic
  const result = await someFirebaseOperation();
  return result;
}
```

2. Use in component:
```jsx
import bookingService from '../services/bookingService';

async function handleAction() {
  const result = await bookingService.myNewFunction();
}
```

## 🎨 Styling

All styles are in `src/styles/global.css`. Uses CSS variables for theming:

```css
:root {
  --accent-primary: #6366f1;
  --bg-main: #0a0e27;
  /* ...etc */
}

[data-theme="light"] {
  --bg-main: #f8f9fc;
  /* Override for light mode */
}
```

Toggle theme: Click the sun/moon icon in navbar.

## 🐛 Troubleshooting

### "Firebase not initialized" error
- Check that Firebase config in `src/firebase/config.js` is correct
- Make sure you've enabled Authentication and Firestore in Firebase Console

### "Permission denied" errors
- Check Firestore security rules are set correctly
- Verify user is authenticated
- Check user role in Firestore

### Seats not loading
- Run database initialization at `/init-db`
- Check browser console for errors
- Verify Firestore rules allow reads

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📚 Further Development

### Completed Features
✅ Authentication (Email & Google)  
✅ Seat booking system  
✅ Real-time seat updates  
✅ User stats tracking  
✅ Dark/light theme  
✅ Responsive design  

### To-Do List
- [ ] Complete Profile page with full booking history
- [ ] Implement Leaderboard with rankings
- [ ] Add QR code generation and scanning
- [ ] Create admin panel
- [ ] Add achievements system
- [ ] Implement notification system
- [ ] Add seat filters and search
- [ ] Export user data feature

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Firebase Hosting

```bash
# Build the project
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init hosting

# Deploy
firebase deploy
```

### Environment Variables for Production

Create `.env` file:
```
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Update `src/firebase/config.js` to use these:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ...etc
};
```

## 💡 Tips

1. **Use React DevTools**: Install the browser extension to debug components
2. **Check Console**: Browser console shows helpful errors and warnings
3. **Hot Reload**: Save files to see changes instantly (no refresh needed!)
4. **Component Structure**: Keep components small and focused
5. **Context Wisely**: Only put global state in context (auth, theme, etc.)

## 🤝 Getting Help

- Check browser console for errors
- Review Firebase Console logs
- Ensure all dependencies are installed
- Verify Firebase configuration is correct

## 📄 License

MIT License - Feel free to use and modify!

---

**Happy Coding! 🎉**
