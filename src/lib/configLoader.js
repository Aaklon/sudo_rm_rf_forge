const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../config/libraryConfig.json");

function getConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading config:", error);
    return {
      openingTime: "08:00",
      closingTime: "22:00",
      maxBookingDuration: 120,
      minBookingDuration: 15,
      graceMinutes: 5,
      noShowPenaltyXP: -50,
    };
  }
}

function updateConfig(newConfig) {
  try {
    const current = getConfig();
    const updated = { ...current, ...newConfig };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (error) {
    console.error("Error writing config:", error);
    throw error;
  }
}

function isWithinWorkingHours(dateTime) {
  const config = getConfig();
  const [openH, openM] = config.openingTime.split(":").map(Number);
  const [closeH, closeM] = config.closingTime.split(":").map(Number);

  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const openInMinutes = openH * 60 + openM;
  const closeInMinutes = closeH * 60 + closeM;

  return timeInMinutes >= openInMinutes && timeInMinutes < closeInMinutes;
}

module.exports = { getConfig, updateConfig, isWithinWorkingHours };
