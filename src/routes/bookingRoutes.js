const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/book", authMiddleware, bookingController.bookSeat);
router.get("/status", authMiddleware, bookingController.getBookingStatus);

module.exports = router;
