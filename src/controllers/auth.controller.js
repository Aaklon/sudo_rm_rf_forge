const { auth, admin } = require("../config/firebase.config");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} = require("firebase/auth");

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, { displayName });

    // Get ID token
    const idToken = await user.getIdToken();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
      token: idToken,
    });
  } catch (error) {
    console.error("Registration error:", error);

    let message = "Registration failed";
    if (error.code === "auth/email-already-in-use") {
      message = "Email already in use";
    } else if (error.code === "auth/weak-password") {
      message = "Password is too weak";
    }

    res.status(400).json({
      error: "Registration failed",
      message,
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Get ID token
    const idToken = await user.getIdToken();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
      token: idToken,
    });
  } catch (error) {
    console.error("Login error:", error);

    let message = "Login failed";
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      message = "Invalid email or password";
    } else if (error.code === "auth/too-many-requests") {
      message = "Too many failed attempts. Please try again later";
    }

    res.status(401).json({
      error: "Authentication failed",
      message,
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    if (!admin) {
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    const userRecord = await admin.auth().getUser(uid);

    res.status(200).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        createdAt: userRecord.metadata.creationTime,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      error: "Failed to fetch user profile",
    });
  }
};

/**
 * Logout user (client-side operation, this endpoint is optional)
 */
const logout = async (req, res) => {
  try {
    // Note: Actual logout happens on client side using Firebase SDK
    // This endpoint can be used for logging or cleanup operations
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Logout failed",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
