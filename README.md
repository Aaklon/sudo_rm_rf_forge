# Express QR Code Application

A full-stack Express.js application with Firebase authentication and QR code scanning capabilities.

## 🚀 Features

- **Firebase Authentication**: User registration and login
- **QR Code Generation**: Generate QR codes from data
- **QR Code Scanning**: Real-time QR code scanning using html5-qrcode
- **Protected Routes**: Middleware-based authentication
- **Input Validation**: Request validation for all endpoints
- **MVC Architecture**: Organized code structure

## 📁 Project Structure

```
forge-1/
├── src/
│   ├── config/
│   │   └── firebase.config.js      # Firebase configuration
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication logic
│   │   └── qr.controller.js        # QR code logic
│   ├── middleware/
│   │   └── auth.middleware.js      # Authentication middleware
│   ├── routes/
│   │   ├── auth.routes.js          # Auth routes
│   │   └── qr.routes.js            # QR routes
│   └── validators/
│       ├── auth.validator.js       # Auth validation
│       └── qr.validator.js         # QR validation
├── public/
│   ├── css/
│   │   └── style.css               # Styles
│   ├── js/
│   │   └── app.js                  # Client-side logic
│   └── index.html                  # Main HTML page
├── server.js                        # Entry point
├── .env.example                     # Environment variables template
└── package.json                     # Dependencies
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Download service account key (Project Settings > Service Accounts)
4. Save it as `serviceAccountKey.json` in the project root

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration values.

### 4. Run the Application

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start at `http://localhost:3000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)

### QR Code

- `POST /api/qr/generate` - Generate QR code (protected)
- `POST /api/qr/verify` - Verify scanned QR code (protected)
- `GET /api/qr/history` - Get QR code history (protected)

### Health Check

- `GET /api/health` - Server health check

## 🔐 Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token
3. Client stores token in localStorage
4. Client includes token in Authorization header for protected routes
5. Server verifies token using Firebase Admin SDK

## 📱 QR Code Features

- **Generate**: Create QR codes from any text/data
- **Scan**: Real-time camera-based QR code scanning
- **Verify**: Backend verification of scanned codes
- **History**: Track QR code generation/scan history

## 🔧 Technologies Used

- **Backend**: Express.js, Node.js
- **Authentication**: Firebase Auth, Firebase Admin SDK
- **QR Code**: html5-qrcode, qrcode
- **Dev Tools**: Nodemon
- **Middleware**: CORS, dotenv

## 📝 Notes

- Make sure to add `serviceAccountKey.json` to `.gitignore`
- Never commit `.env` file to version control
- Camera access is required for QR code scanning
- HTTPS is recommended for production deployment

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

ISC
