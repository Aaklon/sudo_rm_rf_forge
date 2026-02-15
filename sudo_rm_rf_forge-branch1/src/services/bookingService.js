import api from "./api";

class BookingService {
  // Create a new booking
  async createBooking(seatNumber, startTime, endTime) {
    const durationMins = Math.floor((endTime - startTime) / 60000);
    const data = await api.post("/bookings/book", {
      seatNumber,
      startTime: startTime.toISOString(),
      duration: durationMins,
    });
    return data;
  }

  // Get current booking status (active/pending)
  async getUserActiveBooking() {
    try {
      const data = await api.get("/bookings/status");
      return data.booking;
    } catch (error) {
      console.error("Error fetching active booking:", error);
      return null;
    }
  }

  // Get booking history
  async getUserBookings() {
    try {
      const data = await api.get("/bookings/history");
      return data.bookings || [];
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  }

  // Get penalties (no-shows)
  async getPenalties() {
    try {
      const data = await api.get("/bookings/penalties");
      return data.penalties || [];
    } catch (error) {
      console.error("Error fetching penalties:", error);
      return [];
    }
  }

  // Cancel booking
  async cancelBooking() {
    const data = await api.post("/bookings/cancel");
    return data;
  }
}

export default new BookingService();
