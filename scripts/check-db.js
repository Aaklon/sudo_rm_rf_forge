const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkConnection() {
  try {
    console.log("Attempting to connect to database...");
    await prisma.$connect();
    console.log("Connection successful!");

    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
