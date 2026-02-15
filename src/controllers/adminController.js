const prisma = require("../lib/prisma");
const { getConfig, updateConfig } = require("../lib/configLoader");

// Barcode scan - handles both entry and exit
exports.barcodeScan = async (req, res) => {
  try {
    const { rollNumber } = req.body;

    if (!rollNumber) {
      return res.status(400).json({ error: "Roll number is required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { rollNumber },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check for open entry (no exit yet) → mark exit
    const openEntry = await prisma.entryLog.findFirst({
      where: {
        rollNumber,
        exitTime: null,
      },
      orderBy: { entryTime: "desc" },
    });

    if (openEntry) {
      // Mark exit
      const now = new Date();
      const updatedLog = await prisma.entryLog.update({
        where: { id: openEntry.id },
        data: { exitTime: now },
      });

      // Calculate duration
      const durationMs = now - new Date(openEntry.entryTime);
      const durationMins = Math.floor(durationMs / 60000);

      // If there's an active seat, free it and log the booking
      const activeSeat = await prisma.seat.findFirst({
        where: {
          bookedByRollNumber: rollNumber,
          status: "ACTIVE",
        },
      });

      if (activeSeat) {
        // Create completed booking record
        await prisma.booking.create({
          data: {
            seatNumber: activeSeat.seatNumber,
            rollNumber,
            startTime: activeSeat.startTime || openEntry.entryTime,
            endTime: now,
            duration: durationMins,
            status: "COMPLETED",
            xpEarned: Math.floor(durationMins),
          },
        });

        // Free the seat
        await prisma.seat.update({
          where: { id: activeSeat.id },
          data: {
            status: "FREE",
            bookedByRollNumber: null,
            startTime: null,
            expiryTime: null,
          },
        });
      }

      return res.json({
        action: "EXIT",
        message: `Exit recorded for ${user.name}`,
        log: updatedLog,
        duration: durationMins,
        seatNumber: activeSeat?.seatNumber || openEntry.seatNumber,
      });
    }

    // No open entry → check for pending booking → mark entry
    const pendingBooking = await prisma.seat.findFirst({
      where: {
        bookedByRollNumber: rollNumber,
        status: "PENDING",
      },
    });

    if (!pendingBooking) {
      // Check if they have an active booking already
      const activeBooking = await prisma.seat.findFirst({
        where: {
          bookedByRollNumber: rollNumber,
          status: "ACTIVE",
        },
      });

      if (activeBooking) {
        return res.status(400).json({
          error: "User already has an active session",
          seat: activeBooking,
        });
      }

      return res
        .status(404)
        .json({ error: "No pending booking found for this roll number" });
    }

    // Activate the seat
    await prisma.seat.update({
      where: { id: pendingBooking.id },
      data: { status: "ACTIVE" },
    });

    // Create entry log
    const entryLog = await prisma.entryLog.create({
      data: {
        rollNumber,
        seatNumber: pendingBooking.seatNumber,
      },
    });

    return res.json({
      action: "ENTRY",
      message: `Entry recorded for ${user.name}`,
      log: entryLog,
      seatNumber: pendingBooking.seatNumber,
      seatFloor: pendingBooking.floorNumber,
    });
  } catch (error) {
    console.error("Barcode scan error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Free all seats
exports.freeAllSeats = async (req, res) => {
  try {
    const bookedSeats = await prisma.seat.findMany({
      where: { status: { not: "FREE" } },
    });

    // Log all active/pending as cancelled
    for (const seat of bookedSeats) {
      if (seat.bookedByRollNumber) {
        await prisma.booking.create({
          data: {
            seatNumber: seat.seatNumber,
            rollNumber: seat.bookedByRollNumber,
            startTime: seat.startTime || new Date(),
            endTime: new Date(),
            duration: 0,
            status: "ADMIN_FREED",
            xpEarned: 0,
          },
        });
      }
    }

    // Close any open entry logs
    await prisma.entryLog.updateMany({
      where: { exitTime: null },
      data: { exitTime: new Date() },
    });

    // Free all seats
    await prisma.seat.updateMany({
      data: {
        status: "FREE",
        bookedByRollNumber: null,
        startTime: null,
        expiryTime: null,
      },
    });

    res.json({
      message: "All seats freed",
      freedCount: bookedSeats.length,
    });
  } catch (error) {
    console.error("Free all seats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get library config
exports.getLibraryConfig = async (req, res) => {
  try {
    const config = getConfig();
    res.json({ config });
  } catch (error) {
    console.error("Get config error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update library config
exports.updateLibraryConfig = async (req, res) => {
  try {
    const updates = req.body;
    const updated = updateConfig(updates);
    res.json({ message: "Config updated", config: updated });
  } catch (error) {
    console.error("Update config error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get entry/exit logs
exports.getEntryLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.entryLog.findMany({
        orderBy: { entryTime: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true, rollNumber: true },
          },
        },
      }),
      prisma.entryLog.count(),
    ]);

    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get entry logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all bookings (admin view)
exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true, rollNumber: true },
          },
        },
      }),
      prisma.booking.count(),
    ]);

    res.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all seats (admin view)
exports.getAllSeatsAdmin = async (req, res) => {
  try {
    const seats = await prisma.seat.findMany({
      orderBy: { seatNumber: "asc" },
      include: {
        bookedBy: {
          select: { name: true, email: true, rollNumber: true },
        },
      },
    });
    res.json({ seats });
  } catch (error) {
    console.error("Get seats admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
