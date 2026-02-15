const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
// const authMiddleware = require("../middleware/authMiddleware");
// Assuming admin routes might need admin auth, but user didn't specify.
// For now, making it open or basic auth?
// "next the admin panel has a barccode scanner which sends roll numer"
// I will assume it's an open endpoint for the scanner or protected by same auth.
// Let's leave it open for simplicity or add todo.

router.post("/validate", adminController.validateEntry);

module.exports = router;
