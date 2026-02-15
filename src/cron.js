const cron = require("node-cron");
const prisma = require("./lib/prisma");

// Run every 1 minute
cron.schedule("* * * * *", async () => {
  console.log("Running cron job: Check for expired pending seats...");
  try {
    const now = new Date();

    // Find seats where status = PENDING and startTime < NOW
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

      for (const seat of expiredSeats) {
        // Create NO_SHOW booking record
        if (seat.bookedByRollNumber) {
          await prisma.booking.create({
            data: {
              seatNumber: seat.seatNumber,
              rollNumber: seat.bookedByRollNumber,
              startTime: seat.startTime || now,
              endTime: seat.expiryTime || now,
              duration:
                seat.startTime && seat.expiryTime
                  ? Math.floor((seat.expiryTime - seat.startTime) / 60000)
                  : 0,
              status: "NO_SHOW",
              xpEarned: -50,
            },
          });
        }

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
      }

      console.log("Released expired seats and recorded no-shows.");
    }

    // Also check for ACTIVE seats past expiry time
    const expiredActive = await prisma.seat.findMany({
      where: {
        status: "ACTIVE",
        expiryTime: {
          lt: now,
        },
      },
    });

    if (expiredActive.length > 0) {
      console.log(
        `Found ${expiredActive.length} expired active seats. Completing...`,
      );

      for (const seat of expiredActive) {
        // Create COMPLETED booking record
        if (seat.bookedByRollNumber) {
          const durationMins =
            seat.startTime && seat.expiryTime
              ? Math.floor((seat.expiryTime - seat.startTime) / 60000)
              : 0;

          await prisma.booking.create({
            data: {
              seatNumber: seat.seatNumber,
              rollNumber: seat.bookedByRollNumber,
              startTime: seat.startTime || now,
              endTime: seat.expiryTime || now,
              duration: durationMins,
              status: "COMPLETED",
              xpEarned: durationMins,
            },
          });

          // Close any open entry logs
          await prisma.entryLog.updateMany({
            where: {
              rollNumber: seat.bookedByRollNumber,
              exitTime: null,
            },
            data: { exitTime: now },
          });
        }

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
      }

      console.log("Completed expired active sessions.");
    }
  } catch (error) {
    console.error("Cron job error:", error);
  }
});
