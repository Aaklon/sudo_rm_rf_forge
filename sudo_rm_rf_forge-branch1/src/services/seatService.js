import api from "./api";

class SeatService {
  // Get all seats
  async getSeats() {
    try {
      const data = await api.get("/bookings/seats");
      return data.seats || [];
    } catch (error) {
      console.error("Error fetching seats:", error);
      return [];
    }
  }

  // Poll-based seat updates (replaces Firestore realtime)
  startPolling(callback, intervalMs = 15000) {
    // Initial fetch
    this.getSeats().then(callback);

    // Set up polling
    const intervalId = setInterval(async () => {
      const seats = await this.getSeats();
      callback(seats);
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

export default new SeatService();
