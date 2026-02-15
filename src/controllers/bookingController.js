const prisma = require("../lib/prisma");
const { isWithinWorkingHours, getConfig } = require("../lib/configLoader");

exports.bookSeat = async (req, res) => {
  try {
    const { seatNumber, startTime, duration } = req.body;
    const userId = req.user.userId;

    if (!seatNumber || !startTime || !duration) {
      return res
        .status(400)
        .json({ error: "Seat number, start time, and duration are required" });
    }

    const config = getConfig();

    // Validate duration
    if (duration < config.minBookingDuration) {
      return res.status(400).json({
        error: `Minimum booking duration is ${config.minBookingDuration} minutes`,
      });
    }
    if (duration > config.maxBookingDuration) {
      return res.status(400).json({
        error: `Maximum booking duration is ${config.maxBookingDuration} minutes`,
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const startDateTime = new Date(startTime);

    // Validate working hours
    if (!isWithinWorkingHours(startDateTime)) {
      return res.status(400).json({
        error: `Bookings only allowed between ${config.openingTime} and ${config.closingTime}`,
      });
    }

    const durationInMs = duration * 60 * 1000;
    const expiryDateTime = new Date(startDateTime.getTime() + durationInMs);

    // Check end time is within working hours
    if (!isWithinWorkingHours(expiryDateTime)) {
      return res.status(400).json({
        error: `Booking end time must be before ${config.closingTime}`,
      });
    }

    // Check if user already has a pending or active booking
    const existingBooking = await prisma.seat.findFirst({
      where: {
        bookedByRollNumber: user.rollNumber,
        status: { in: ["PENDING", "ACTIVE"] },
      },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ error: "You already have a pending or active booking" });
    }

    // Find the seat
    const seat = await prisma.seat.findUnique({ where: { seatNumber } });
    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }
    if (seat.status !== "FREE") {
      return res
        .status(400)
        .json({ error: "Seat is already booked or pending" });
    }

    const updatedSeat = await prisma.seat.update({
      where: { seatNumber },
      data: {
        status: "PENDING",
        bookedByRollNumber: user.rollNumber,
        startTime: startDateTime,
        expiryTime: expiryDateTime,
      },
    });

    res.json({
      message: "Seat booked successfully. Please scan barcode at entry.",
      seat: updatedSeat,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBookingStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const booking = await prisma.seat.findFirst({
      where: {
        bookedByRollNumber: user.rollNumber,
        status: { in: ["PENDING", "ACTIVE"] },
      },
    });

    if (!booking) {
      return res.json({ message: "No active booking", booking: null });
    }

    res.json({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllSeats = async (req, res) => {
  try {
    const seats = await prisma.seat.findMany({
      orderBy: { seatNumber: "asc" },
    });
    res.json({ seats });
  } catch (error) {
    console.error("Get seats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBookingHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const bookings = await prisma.booking.findMany({
      where: { rollNumber: user.rollNumber },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({ bookings });
  } catch (error) {
    console.error("Get booking history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPenalties = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const noShows = await prisma.booking.findMany({
      where: {
        rollNumber: user.rollNumber,
        status: "NO_SHOW",
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ penalties: noShows });
  } catch (error) {
    console.error("Get penalties error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the user's pending/active seat booking
    const seat = await prisma.seat.findFirst({
      where: {
        bookedByRollNumber: user.rollNumber,
        status: { in: ["PENDING", "ACTIVE"] },
      },
    });

    if (!seat) {
      return res.status(404).json({ error: "No active booking to cancel" });
    }

    // Log as CANCELLED in Booking history
    await prisma.booking.create({
      data: {
        seatNumber: seat.seatNumber,
        rollNumber: user.rollNumber,
        startTime: seat.startTime || new Date(),
        endTime: seat.expiryTime || new Date(),
        duration:
          seat.startTime && seat.expiryTime
            ? Math.floor((seat.expiryTime - seat.startTime) / 60000)
            : 0,
        status: "CANCELLED",
        xpEarned: 0,
      },
    });

    // Free the seat
    await prisma.seat.update({
      where: { id: seat.id },
      data: {
        status: "FREE",
        bookedByRollNumber: null,
        startTime: null,
        expiryTime: null,
      },
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
