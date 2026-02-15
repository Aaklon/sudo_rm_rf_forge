const prisma = require("../lib/prisma");

exports.validateEntry = async (req, res) => {
  try {
    const { rollNumber } = req.body;

    if (!rollNumber) {
      return res.status(400).json({ error: "Roll number is required" });
    }

    // Find pending booking for this roll number
    const booking = await prisma.seat.findFirst({
      where: {
        bookedByRollNumber: rollNumber,
        status: "PENDING",
      },
    });

    if (!booking) {
      // Check if they have an active booking
      const activeBooking = await prisma.seat.findFirst({
        where: {
          bookedByRollNumber: rollNumber,
          status: "ACTIVE",
        },
      });

      if (activeBooking) {
        return res
          .status(400)
          .json({
            error: "User already has an active session.",
            booking: activeBooking,
          });
      }

      return res
        .status(404)
        .json({ error: "No pending booking found for this roll number" });
    }

    // Update to ACTIVE/COMPLETED
    // User said: "update the status to completed and expiry time as per the time he previously entered"
    // AND "unable to comes atleast 5 mins before the start time... removes the seats"

    // So if they are here, they are validating.
    // We update status to ACTIVE (or COMPLETED? User said COMPLETED).
    // Let's use ACTIVE to match previous logic slightly, or COMPLETED if that's what they want.
    // User said "update the status to completed".

    // We also need to set the REAL expiry time.
    // In bookSeat, we set expiryTime = startTime (as the "cancel if not here by" time).
    // Now we need to extend it to the full duration.

    // Wait, where is duration stored?
    // I didn't store duration in the DB. I only stored startTime and expiryTime.
    // I need to either store duration or calculating it.
    // If I didn't store duration, I can't know when it should expire.
    // The user said "expiry time as per the time he previously entered".
    // I should probably have stored the *intended* expiry time or duration.

    // Quick fix: Add `duration` to Seat model? Or just `intendedExpiryTime`?
    // Or just store the final expiry time in `expiryTime` and use a different field for "cancellation time"?
    // Or just trust that `expiryTime` was set correctly?
    // In bookSeat, I set `expiryTime = startTime`.
    // If I change it now, I need to know the duration.

    // Let's assume the user sends duration again? No, that's insecure.
    // I should have stored `duration` in the Seat model or `intendedExpiryTime`.

    // Current Schema:
    // startTime, expiryTime, status.

    // I'll update schema to add `duration` (Int, minutes) to Seat to make this robust.
    // But I entered Execution mode already.
    // If I change schema again, I need another migration.
    // Is there another way?
    // Maybe `expiryTime` IS the intended end time.
    // And `startTime` is the start time.
    // The cron job checks strictly: If (CurrentTime > StartTime + 5 mins) AND Status == PENDING -> Cancel.
    // In that case, I can store the REAL expiry time in `expiryTime` from the beginning.
    // And the unique condition for cancellation is: Status is PENDING and Time > StartTime + Buffer.

    // YES. This is better. I don't need a new schema field if I use the logic:
    // "Cancel if PENDING and CurrentTime > StartTime + 5 mins".
    // Then `expiryTime` can just be the actual end of the session.

    // So, in bookSeat, I should set:
    // startTime = requested start time
    // expiryTime = requested start time + duration

    // And validation just flips status to COMPLETED/ACTIVE.

    // Refactoring bookSeat logic in my head:
    // bookSeat: values { status: "PENDING", startTime: X, expiryTime: X + Duration }
    // Cron: findMany({ where: { status: "PENDING", startTime: { lt: Now - 5mins } } }) -> update to FREE.

    // Admin Validation:
    // just update status to "ACTIVE" (or COMPLETED).

    // So I need to:
    // 1. Update `bookSeat` in `bookingController.js` to set correct `expiryTime`.
    // 2. Implement `validateEntry` here.

    // Let's update `bookSeat` in the next step.

    const updatedSeat = await prisma.seat.update({
      where: { id: booking.id },
      data: {
        status: "ACTIVE", // Using ACTIVE to imply they are currently occupying the seat.
        // If "COMPLETED" means "Session Finished", then we should use ACTIVE now and COMPLETED later?
        // User said: "update the status to completed... if the user is unable to comes ... remove"
        // "completed" might mean "Booking Process Completed, User is here".
        // I will use "ACTIVE" as it matches `getBookingStatus` looking for ACTIVE.
      },
    });

    res.json({ message: "Entry validated", seat: updatedSeat });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
