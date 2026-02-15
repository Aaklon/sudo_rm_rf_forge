const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateRegistration,
  validateLogin,
} = require("../validators/auth.validator");
const { verifyToken } = require("../middleware/auth.middleware");

// Public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);

// Protected routes
router.get("/profile", verifyToken, authController.getProfile);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
