-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seatNumber" TEXT NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "startTime" DATETIME,
    "expiryTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'FREE',
    "bookedByRollNumber" TEXT,
    CONSTRAINT "Seat_bookedByRollNumber_fkey" FOREIGN KEY ("bookedByRollNumber") REFERENCES "User" ("rollNumber") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_rollNumber_key" ON "User"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_seatNumber_key" ON "Seat"("seatNumber");
