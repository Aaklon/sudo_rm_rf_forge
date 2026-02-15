const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authMiddleware = (req, res, next) => {
  let token = req.cookies.token;

  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
