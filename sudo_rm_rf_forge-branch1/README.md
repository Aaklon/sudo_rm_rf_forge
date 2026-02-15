# BookMySeat - React Version

A premium seat booking system for libraries and study spaces, converted from HTML to React.

## 🚀 Features

- **Smart Booking System**: Reserve seats with QR code check-in
- **Real-time Updates**: Firebase Firestore for live seat availability
- **Gamification**: XP system, levels, and achievements
- **Analytics**: Track focus time and productivity patterns
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bookmyseat-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase configuration

4. **Configure Firebase**
   - Open `src/firebase/config.js`
   - Replace the placeholder config with your actual Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. **Set up Firestore Rules**
   In Firebase Console, go to Firestore Database → Rules and add:
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
         allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
         allow delete: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
       }
       
       match /config/{document} {
         allow read: if request.auth != null;
         allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

## 🎮 Running the Application

1. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000)

2. **Initialize the database** (First time only)
   - Navigate to [http://localhost:3000/init-db](http://localhost:3000/init-db)
   - Click "Initialize Database" to set up seats and configuration

3. **Create an admin account**
   - Register a new account at [http://localhost:3000/auth](http://localhost:3000/auth)
   - Go to Firebase Console → Authentication → Users
   - Find your user and copy the UID
   - Go to Firestore → users → [your UID]
   - Change the `role` field from `"student"` to `"admin"`

## 📁 Project Structure

```
bookmyseat-react/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── ProtectedRoute.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── firebase/
│   │   └── config.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Auth.js
│   │   ├── Dashboard.js
│   │   ├── Profile.js
│   │   ├── Leaderboard.js
│   │   └── InitDB.js
│   ├── services/
│   │   ├── bookingService.js
│   │   └── seatService.js
│   ├── styles/
│   │   └── global.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🔑 Key Components

### Context Providers

- **AuthContext**: Manages user authentication state and operations
- **ThemeContext**: Handles dark/light theme switching

### Services

- **bookingService**: Handles all booking-related Firebase operations
- **seatService**: Manages seat data and real-time updates

### Pages

- **Home**: Landing page with features and CTA
- **Auth**: Login and registration
- **Dashboard**: Main booking interface with seat grid
- **Profile**: User profile, stats, and achievements
- **Leaderboard**: User rankings (to be implemented)
- **InitDB**: Database initialization utility

## 🎨 Styling

The project uses CSS variables for theming. All styles are in `src/styles/global.css`. The theme can be toggled using the theme button in the navbar, which switches between light and dark modes.

## 🔒 Authentication

The app supports:
- Email/Password authentication
- Google Sign-In
- Protected routes for authenticated users
- Role-based access (student/admin)

## 📊 Database Structure

### Collections

**users**
- Stores user profiles
- Fields: name, email, role, stats, achievements, etc.

**seats**
- Stores seat information
- Fields: id, type, status, floor, currentBooking, etc.

**bookings**
- Stores booking records
- Fields: userId, seatId, startTime, endTime, status, etc.

**config**
- Stores app configuration
- Fields: library name, hours, rules, etc.

## 🚧 TODO / Future Enhancements

- [ ] Complete Dashboard page with full booking modal
- [ ] Implement Profile page with booking history
- [ ] Create Leaderboard page
- [ ] Add QR code generation and scanning
- [ ] Implement attendance tracking
- [ ] Add penalty system for no-shows
- [ ] Create admin panel
- [ ] Add real-time notifications
- [ ] Implement achievement system
- [ ] Add export data functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Note**: Remember to never commit your Firebase configuration with real API keys to public repositories. Use environment variables for sensitive information in production.
