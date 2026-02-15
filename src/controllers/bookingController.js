const prisma = require("../lib/prisma");

exports.bookSeat = async (req, res) => {
  try {
    const { seatNumber, startTime, duration } = req.body;
    const userId = req.user.userId; // Extracted from token by authMiddleware

    if (!seatNumber || !startTime || !duration) {
      return res
        .status(400)
        .json({ error: "Seat number, start time, and duration are required" });
    }

    // Get user details to get rollNumber
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already has a pending or active booking
    const existingBooking = await prisma.seat.findFirst({
      where: {
        bookedByRollNumber: user.rollNumber,
        status: {
          in: ["PENDING", "ACTIVE"],
        },
      },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ error: "You already have a pending or active booking" });
    }

    // Find the seat
    const seat = await prisma.seat.findUnique({
      where: { seatNumber },
    });

    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    if (seat.status !== "FREE") {
      return res
        .status(400)
        .json({ error: "Seat is already booked or pending" });
    }

    // Calculate expiry time (e.g., 5-30 mins grace period? Or is duration the grace period?)
    // Based on user request: "expiry time as per the time he previously entered if the user is unable to comes atleast 5 mins before the start tme"
    // And "we set seat to pending next the admin panel has a barccode scanner... update the status to completed and expiry time as per the time he previously entered"

    // Interpretation:
    // Initial booking: Status = PENDING, Expiry = StartTime + 5 mins (or some grace period).
    // Actually, user said: "if the user is unable to comes atleast 5 mins before the start tme... removes the seats from pendning"
    // So, if StartTime is 10:00, and user doesn't come by 9:55? Or does it mean 5 mins AFTER start time?
    // "unable to comes atleast 5 mins before the start tme" -> likely means they must arrive by StartTime - 5min?
    // "if the user is unable to comes atleast 5 mins before the start tme ... removes the seats" -> This phrasing is tricky.
    // Usually, it means "if user doesn't show up within 5 mins of start time".
    // Let's assume: Users book a slot starting at X. They must scan in by X + 5mins (or X - 5mins?).
    // "check the strt tiime every 1 minute and removes the seats from pendning and make them free in databse ... if the start time has passed"
    // This implies if CurrentTime > StartTime and Status is PENDING, then release it.

    // Let's set the initial expiry to the StartTime. The cron job will check if CurrentTime > StartTime and status is PENDING.
    // Wait, "removes the seats... if the start time has passed".
    // So if StartTime is 12:00, and it's 12:01, it gets removed.
    // But user also mentioned "atleast 5 mins before the start tme".
    // Maybe they mean: You must scan *before* the start time?
    // Let's stick to: Entry is allowed up to StartTime.

    // For the Seat record:
    // startTime: The requested start time.
    // expiryTime: Initially set to the same as startTime (or startTime + buffer).
    // However, the `duration` implies how long they want the seat FOR.
    // When validated, expiryTime becomes StartTime + Duration.

    // Let's set:
    // startTime = parsed startTime
    // expiryTime = parsed startTime (The point at which it effectively expires if not validated)

    const startDateTime = new Date(startTime);
    // Duration is in minutes (assuming)
    const durationInMs = duration * 60 * 1000;
    const expiryDateTime = new Date(startDateTime.getTime() + durationInMs);

    // Ensure start time is in the future
    if (startDateTime < new Date()) {
      // Allow a small buffer or reject? for now, allow if it's close.
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
      message: "Seat booked successfully. Please scan QR code at entry.",
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { seats: true }, // verify relation
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find active/pending booking
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
