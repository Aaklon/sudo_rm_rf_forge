const prisma = require("../src/lib/prisma");
const bcrypt = require("bcryptjs");

async function seed() {
  console.log("🗑️  Clearing existing data...");
  await prisma.entryLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log("👤 Creating admin user...");
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@library.com",
      rollNumber: "ADMIN001",
      password: adminHash,
      role: "admin",
    },
  });

  // Create test student user
  console.log("👤 Creating test student user...");
  const studentHash = await bcrypt.hash("student123", 10);
  await prisma.user.create({
    data: {
      name: "Test Student",
      email: "student@test.com",
      rollNumber: "21BCE001",
      password: studentHash,
      role: "student",
    },
  });

  // Create seats: 4 floors × 50 seats
  console.log("🪑 Creating 200 seats across 4 floors...");
  const floors = [
    { number: 0, prefix: "G" },
    { number: 1, prefix: "F1" },
    { number: 2, prefix: "F2" },
    { number: 3, prefix: "F3" },
  ];

  for (const floor of floors) {
    for (let i = 1; i <= 50; i++) {
      const seatNumber = `${floor.prefix}-${String(i).padStart(2, "0")}`;
      await prisma.seat.create({
        data: {
          seatNumber,
          floorNumber: floor.number,
          status: "FREE",
        },
      });
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("📋 Test Accounts:");
  console.log("   Admin:   admin@library.com / admin123");
  console.log("   Student: student@test.com / student123");
  console.log("");
  console.log(
    "🪑 200 seats created (G-01..G-50, F1-01..F1-50, F2-01..F2-50, F3-01..F3-50)",
  );
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
