const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/barcode-scan", adminController.barcodeScan);
router.post("/free-all", adminController.freeAllSeats);
router.get("/config", adminController.getLibraryConfig);
router.put("/config", adminController.updateLibraryConfig);
router.get("/logs", adminController.getEntryLogs);
router.get("/bookings", adminController.getAllBookings);
router.get("/seats", adminController.getAllSeatsAdmin);

module.exports = router;
