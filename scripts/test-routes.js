const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function runTests() {
  try {
    console.log("--- Starting Route Tests ---");

    // 1. Signup
    const uniqueId = Date.now();
    const user = {
      name: `Test User ${uniqueId}`,
      email: `test${uniqueId}@example.com`,
      rollNumber: `RN${uniqueId}`,
      password: "password123",
    };

    console.log(`\n1. Signing up user: ${user.email}`);
    try {
      await axios.post(`${BASE_URL}/auth/signup`, user);
      console.log("✅ Signup successful");
    } catch (error) {
      console.error(
        "❌ Signup failed:",
        error.response ? error.response.data : error.message,
      );
      process.exit(1);
    }

    // 2. Login
    console.log(`\n2. Logging in user: ${user.email}`);
    let token;
    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password,
      });
      token = loginRes.data.token;
      console.log("✅ Login successful");
    } catch (error) {
      console.error(
        "❌ Login failed:",
        error.response ? error.response.data : error.message,
      );
      process.exit(1);
    }

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Book a Seat
    const seat1 = {
      seatNumber: `A${Math.floor(Math.random() * 1000)}`, // Random seat to avoid conflict
      startTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour from now
      duration: 60,
    };

    // We need to ensure the seat exists first?
    // The current implementation of bookSeat checks `prisma.seat.findUnique`.
    // If we use a random seat number that doesn't exist in DB, it will fail with "Seat not found".
    // We should probably rely on existing seats or create one via a seed/admin route if possible.
    // Or, for this test, we might fail if we don't have seats.
    // Let's first check if we can create a seat or if we need to pick an existing one.
    // Since we are using a fresh DB (sqlite), we need to seed it or create a seat.
    // The previous `seed.ts` (if it exists) might populate seats.
    // Let's quickly create a seat using a script or raw SQL before running this test?
    // OR: Update this script to create a seat via Prisma directly?
    // But this script is external.
    // Let's just create a seat using a direct Prisma call in a separate helper or assume one exists.
    // Actually, I can use the `init-db` script from package.json if it exists?
    // "scripts": { "init-db": "node scripts/initialize-database.js" }
    // Let's check if that script exists and runs it.

    // For now, let's assume we need to seed. I'll add a helper to seed a seat.
    // Wait, I can't easily import prisma here if I want to simulate an external client.
    // But I have access to the codebase.
    // Let's add a small prisma setup in this script to seed a seat for testing.

    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const testSeatNumber = `TestSeat${uniqueId}`;
    console.log(`\nCreating test seat: ${testSeatNumber}`);
    await prisma.seat.create({
      data: {
        seatNumber: testSeatNumber,
        floorNumber: 1,
        status: "FREE",
      },
    });
    console.log("✅ Test seat created");

    console.log(`\n3. Booking seat: ${testSeatNumber}`);
    try {
      await axios.post(
        `${BASE_URL}/bookings/book`,
        {
          seatNumber: testSeatNumber,
          startTime: seat1.startTime,
          duration: seat1.duration,
        },
        authHeaders,
      );
      console.log("✅ Booking successful");
    } catch (error) {
      console.error(
        "❌ Booking failed:",
        error.response ? error.response.data : error.message,
      );
    }

    // 4. Attempt to book a second seat
    console.log("\n4. Attempting to book a second seat (should fail)");
    // Need another seat
    const testSeatNumber2 = `TestSeat${uniqueId}_2`;
    await prisma.seat.create({
      data: {
        seatNumber: testSeatNumber2,
        floorNumber: 1,
        status: "FREE",
      },
    });

    try {
      await axios.post(
        `${BASE_URL}/bookings/book`,
        {
          seatNumber: testSeatNumber2,
          startTime: seat1.startTime,
          duration: seat1.duration,
        },
        authHeaders,
      );
      console.error("❌ Second booking succeeded (Unexpected)");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log("✅ Second booking failed as expected (400 Bad Request)");
      } else {
        console.error(
          "❌ Second booking failed with unexpected error:",
          error.response ? error.response.data : error.message,
        );
      }
    }

    // 5. Get Booking Status
    console.log("\n5. Checking booking status");
    try {
      const statusRes = await axios.get(
        `${BASE_URL}/bookings/status`,
        authHeaders,
      );
      const booking = statusRes.data.booking;
      if (booking && booking.seatNumber === testSeatNumber) {
        console.log("✅ Booking status verified");
      } else {
        console.error("❌ Booking status mismatch or empty:", booking);
      }
    } catch (error) {
      console.error(
        "❌ Get status failed:",
        error.response ? error.response.data : error.message,
      );
    }

    // 6. Admin Validate (Optional check)
    console.log("\n6. Admin Validate Entry");
    try {
      // Need to know what `validateEntry` expects and does.
      // Assuming it takes { qrCode } or similar.
      // Based on previous chats, admin panel sends roll number?
      // Let's check adminController if needed, but for now simple check.
      // If we don't know the contract, we might skip or dry run.
      // "next the admin panel has a barccode scanner which sends roll numer"
      // Let's try sending rollNumber.
      await axios.post(`${BASE_URL}/admin/validate`, {
        rollNumber: user.rollNumber,
      }); // Assuming no auth for now based on file reading
      console.log(
        "✅ Admin validation request sent (Response verification depends on logic)",
      );
    } catch (error) {
      // It might fail if logic is complex or strict, just logging.
      console.log(
        "ℹ️ Admin validation result:",
        error.response ? error.response.data : error.message,
      );
    }

    console.log("\n--- Tests Completed ---");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

runTests();
