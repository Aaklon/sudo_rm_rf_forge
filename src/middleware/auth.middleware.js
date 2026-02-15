const { admin } = require("../config/firebase.config");

/**
 * Middleware to verify Firebase ID token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    if (!admin) {
      return res.status(500).json({
        error: "Server configuration error",
        message: "Firebase Admin SDK not initialized",
      });
    }

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    // Check custom claims for admin role
    if (req.user.admin === true) {
      next();
    } else {
      return res.status(403).json({
        error: "Forbidden",
        message: "Admin access required",
      });
    }
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
