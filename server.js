const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const authMiddleware = require("./src/middleware/authMiddleware");

const bookingRoutes = require("./src/routes/bookingRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

// Start Cron Job
require("./src/cron");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Example protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
