const cron = require("node-cron");
const prisma = require("./lib/prisma");

// Run every 1 minute
cron.schedule("* * * * *", async () => {
  console.log("Running cron job: Check for expired pending seats...");
  try {
    const now = new Date();
    // Logic:
    // "removes the seats from pendning and make them free in databse ... if the start time has passed"
    // "unable to comes atleast 5 mins before the start tme"

    // If I interpret "atleast 5 mins before start time" strictly, it implies a buffer.
    // However, the simplest robust logic is:
    // If Status is PENDING AND CurrentTime > StartTime (plus maybe 5 mins grace?), then Release.

    // User said: "if the user is unable to comes atleast 5 mins before the start time... removes"
    // This sounds like: if StartTime is 10:00, and it is 9:55, and user is not verified, remove it.
    // BUT they also said "expiry time as per the time he previously entered... if ... pending".

    // The most standard and "safe" interpretation for a booking system:
    // User books for 10:00.
    // They should arrive by 10:00.
    // If it is 10:05 and they are still PENDING -> Cancel.

    // Let's use a 5 minute grace period AFTER start time.
    // OR if user meant "must arrive 5 mins BEFORE", then cancel at StartTime - 5mins?
    // That seems harsh. "Booking for 10:00" usually means you can enter at 10:00.

    // Let's assume the user meant "If the start time has passed (with 5 min buffer maybe?), release it".
    // I will use: If PENDING and now > startTime, release.
    // Actually, let's implement the specific instruction: "if the start time has passed" -> Release.

    // So:
    // Find seats where status = PENDING and startTime < NOW.

    const expiredSeats = await prisma.seat.findMany({
      where: {
        status: "PENDING",
        startTime: {
          lt: now,
        },
      },
    });

    if (expiredSeats.length > 0) {
      console.log(
        `Found ${expiredSeats.length} expired pending seats. Releasing...`,
      );

      const ids = expiredSeats.map((s) => s.id);

      await prisma.seat.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          status: "FREE",
          bookedByRollNumber: null,
          startTime: null,
          expiryTime: null,
        },
      });

      console.log("Released expired seats.");
    }
  } catch (error) {
    console.error("Cron job error:", error);
  }
});
