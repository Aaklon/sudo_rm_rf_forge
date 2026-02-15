const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/book", authMiddleware, bookingController.bookSeat);
router.get("/status", authMiddleware, bookingController.getBookingStatus);
router.get("/seats", authMiddleware, bookingController.getAllSeats);
router.get("/history", authMiddleware, bookingController.getBookingHistory);
router.get("/penalties", authMiddleware, bookingController.getPenalties);
router.post("/cancel", authMiddleware, bookingController.cancelBooking);

module.exports = router;
