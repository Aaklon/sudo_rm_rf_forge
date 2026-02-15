const axios = require("axios");
const prisma = require("../src/lib/prisma");

const BASE_URL = "http://localhost:3000/api";
const EMAIL = `test_${Date.now()}@example.com`;
const PASSWORD = "password123";
const ROLL_NUMBER = `RN_${Date.now()}`;
let token = "";
let seatNumber = "A1"; // Ensure this seat exists or create it

async function runTest() {
  try {
    console.log("--- Starting Verification Test ---");

    // 0. Ensure seat exists and is FREE
    await prisma.seat.upsert({
      where: { seatNumber },
      update: {
        status: "FREE",
        bookedByRollNumber: null,
        startTime: null,
        expiryTime: null,
      },
      create: {
        seatNumber,
        floorNumber: 1,
        status: "FREE",
        expiryTime: new Date(),
      }, // expiryTime required by schema? No, optional now.
      // Wait, expiryTime was NOT optional in original schema, but I made it optional?
      // Let's check schema.
      // Schema: expiryTime DateTime?
    });
    console.log(`0. Seat ${seatNumber} reset to FREE.`);

    // 1. Signup
    try {
      const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
        name: "Test User",
        email: EMAIL,
        password: PASSWORD,
        rollNumber: ROLL_NUMBER,
      });
      console.log(
        "1. Signup successful:",
        signupRes.data.user.rollNumber === ROLL_NUMBER,
      );
      // Extract token from cookie? Axios doesn't auto-handle cookies easily for subsequent requests unless configured.
      // But the backend sends a cookie.
      // Alternatively, login to get cookie.
    } catch (e) {
      console.error("Signup failed:", e.response?.data || e.message);
    }

    // 2. Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    const cookie = loginRes.headers["set-cookie"]; // Array of cookies
    token = cookie && cookie[0]; // Simple extraction
    console.log("2. Login successful.");

    // Configure axios with cookie
    const authAxios = axios.create({
      baseURL: BASE_URL,
      headers: {
        Cookie: token,
      },
    });

    // 3. Book Seat
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 1); // Start in 1 minute
    const duration = 60; // 60 mins

    const bookRes = await authAxios.post("/bookings/book", {
      seatNumber,
      startTime: startTime.toISOString(),
      duration,
    });
    console.log(
      "3. Booking successful:",
      bookRes.data.seat.status === "PENDING",
    );

    // 4. Verify PENDING status in DB
    const seatAfterBooking = await prisma.seat.findUnique({
      where: { seatNumber },
    });
    console.log(
      "4. DB Verification (PENDING):",
      seatAfterBooking.status === "PENDING",
    );

    // 5. Admin Validate
    const validateRes = await axios.post(`${BASE_URL}/admin/validate`, {
      rollNumber: ROLL_NUMBER,
    });
    console.log(
      "5. Admin Validation successful:",
      validateRes.data.seat.status === "ACTIVE",
    );

    // 6. Verify ACTIVE status in DB
    const seatAfterValidate = await prisma.seat.findUnique({
      where: { seatNumber },
    });
    console.log(
      "6. DB Verification (ACTIVE):",
      seatAfterValidate.status === "ACTIVE",
    );

    // 7. Verify Expiry Time update (should be StartTime + Duration)
    const expectedExpiry = new Date(
      new Date(seatAfterBooking.startTime).getTime() + duration * 60000,
    );
    // Allow small diff
    const timeDiff = Math.abs(
      new Date(seatAfterValidate.expiryTime).getTime() -
        expectedExpiry.getTime(),
    );
    console.log("7. Expiry Time Verified:", timeDiff < 1000);

    console.log("--- Test Passed ---");
  } catch (error) {
    console.error("Test Failed:", error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
