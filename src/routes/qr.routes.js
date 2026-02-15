const express = require("express");
const router = express.Router();
const qrController = require("../controllers/qr.controller");
const {
  validateQRData,
  validateQRScan,
} = require("../validators/qr.validator");
const { verifyToken } = require("../middleware/auth.middleware");

// Protected routes - require authentication
router.post("/generate", verifyToken, validateQRData, qrController.generateQR);
router.post("/verify", verifyToken, validateQRScan, qrController.verifyQR);
router.get("/history", verifyToken, qrController.getQRHistory);

module.exports = router;
