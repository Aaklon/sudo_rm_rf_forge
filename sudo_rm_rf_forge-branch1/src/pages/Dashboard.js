import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import seatService from "../services/seatService";
import bookingService from "../services/bookingService";
import { SeatSkeleton, StatsCardSkeleton } from "../components/SkeletonLoaders";

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");

  const [bookingForm, setBookingForm] = useState({
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const stopPolling = seatService.startPolling((updatedSeats) => {
      setSeats(updatedSeats);
      setLoading(false);
    }, 15000);

    checkActiveBooking();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      stopPolling();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const checkActiveBooking = async () => {
    try {
      const active = await bookingService.getUserActiveBooking();
      setActiveBooking(active);
    } catch (error) {
      console.error("Error checking active booking:", error);
    }
  };

  // Map backend status to CSS class
  const mapStatusToClass = (status) => {
    switch (status) {
      case "FREE":
        return "available";
      case "PENDING":
        return "booked";
      case "ACTIVE":
        return "occupied";
      default:
        return "available";
    }
  };

  // Get seat type based on floor
  const getSeatType = (seat) => {
    if (seat.floorNumber <= 1) return "standard";
    if (seat.floorNumber === 2) return "stand";
    return "pod";
  };

  // Get short label for seat (e.g. "G-01" → "01", "F2-15" → "15")
  const getSeatLabel = (seat) => {
    const parts = seat.seatNumber.split("-");
    return parts.length > 1
      ? parts[parts.length - 1]
      : seat.seatNumber.slice(-3);
  };

  const getFilteredSeats = () => {
    let filtered = seats;

    if (floorFilter !== "all") {
      filtered = filtered.filter((s) => s.floorNumber === floorFilter);
    }

    if (filter === "available") {
      filtered = filtered.filter((s) => s.status === "FREE");
    } else if (filter === "standard") {
      filtered = filtered.filter((s) => getSeatType(s) === "standard");
    } else if (filter === "stand") {
      filtered = filtered.filter((s) => getSeatType(s) === "stand");
    } else if (filter === "pod") {
      filtered = filtered.filter((s) => getSeatType(s) === "pod");
    }

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.seatNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickBookAvailable = () => {
    const availableSeats = seats.filter((s) => s.status === "FREE");
    if (availableSeats.length > 0) {
      handleSeatClick(availableSeats[0]);
    } else {
      alert("No seats available at the moment");
    }
  };

  const getCounts = () => ({
    all: seats.length,
    available: seats.filter((s) => s.status === "FREE").length,
    standard: seats.filter((s) => getSeatType(s) === "standard").length,
    stand: seats.filter((s) => getSeatType(s) === "stand").length,
    pod: seats.filter((s) => getSeatType(s) === "pod").length,
  });

  const handleSeatClick = (seat) => {
    if (seat.status !== "FREE") {
      alert("This seat is not available");
      return;
    }
    if (activeBooking) {
      alert("You already have an active or pending booking. Cancel it first.");
      return;
    }
    setSelectedSeat(seat);

    const now = new Date();
    const startTime = new Date(
      Math.ceil(now.getTime() / (15 * 60000)) * (15 * 60000),
    );
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    setBookingForm({
      startTime: formatTimeForInput(startTime),
      endTime: formatTimeForInput(endTime),
    });

    setShowBookingModal(true);
  };

  const formatTimeForInput = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleBookingSubmit = async () => {
    if (!selectedSeat) return;

    try {
      const today = new Date();
      const [startHour, startMin] = bookingForm.startTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = bookingForm.endTime.split(":").map(Number);

      const startTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        startHour,
        startMin,
      );
      const endTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        endHour,
        endMin,
      );

      if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);

      const durationMins = Math.floor((endTime - startTime) / 60000);

      if (durationMins < 15) {
        alert("Minimum booking duration is 15 minutes");
        return;
      }
      if (durationMins > 120) {
        alert("Maximum booking duration is 2 hours");
        return;
      }

      await bookingService.createBooking(
        selectedSeat.seatNumber,
        startTime,
        endTime,
      );
      alert("Seat booked successfully! Please scan barcode at entry.");
      setShowBookingModal(false);
      setSelectedSeat(null);
      await checkActiveBooking();

      // Refresh seats
      const updatedSeats = await seatService.getSeats();
      setSeats(updatedSeats);
    } catch (error) {
      alert(error.message || "Failed to create booking");
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel your booking?"))
      return;
    try {
      await bookingService.cancelBooking();
      alert("Booking cancelled");
      setActiveBooking(null);
      const updatedSeats = await seatService.getSeats();
      setSeats(updatedSeats);
    } catch (error) {
      alert(error.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div
          className="container"
          style={{ paddingTop: "120px", paddingBottom: "60px" }}
        >
          <div className="quick-stats-banner dashboard-skeleton-quick-stats">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="quick-stat-item dashboard-skeleton-quick-stat"
              >
                <div className="skeleton dashboard-skeleton-stat-icon" />
                <div className="quick-stat-content dashboard-skeleton-stat-content">
                  <div className="skeleton dashboard-skeleton-stat-value" />
                  <div className="skeleton dashboard-skeleton-stat-label" />
                </div>
              </div>
            ))}
          </div>
          <div className="seat-grid">
            {[...Array(20)].map((_, i) => (
              <SeatSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  const filteredSeats = getFilteredSeats();
  const counts = getCounts();

  return (
    <>
      <Navbar isAuthenticated={true} />

      <div
        className="container"
        style={{ paddingTop: "120px", paddingBottom: "60px" }}
      >
        {/* Quick Stats Banner */}
        <div className="quick-stats-banner">
          <div className="quick-stat-item">
            <div className="quick-stat-icon">⚡</div>
            <div className="quick-stat-content">
              <span className="quick-stat-value text-primary">
                {counts.available}
              </span>
              <span className="quick-stat-label">Available</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon">🪑</div>
            <div className="quick-stat-content">
              <span className="quick-stat-value text-teal">{counts.all}</span>
              <span className="quick-stat-label">Total Seats</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon">📌</div>
            <div className="quick-stat-content">
              <span className="quick-stat-value text-gold">
                {counts.all - counts.available}
              </span>
              <span className="quick-stat-label">Occupied</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon">👤</div>
            <div className="quick-stat-content">
              <span className="quick-stat-value text-secondary">
                {userProfile?.name || "User"}
              </span>
              <span className="quick-stat-label">
                {userProfile?.rollNumber || ""}
              </span>
            </div>
          </div>
        </div>

        {activeBooking && (
          <div
            style={{
              background: "var(--gradient-primary)",
              padding: "20px",
              borderRadius: "var(--radius-lg)",
              marginBottom: "24px",
              color: "white",
            }}
          >
            <h3 style={{ marginBottom: "8px", color: "white" }}>
              {activeBooking.status === "PENDING"
                ? "⏳ Booking Pending"
                : "🟢 Session Active"}
            </h3>
            <p>Seat: {activeBooking.seatNumber}</p>
            <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
              {activeBooking.status === "PENDING"
                ? "Please scan your barcode at the library entrance to start your session."
                : "Your session is active. Scan barcode again to end."}
            </p>
            <button
              onClick={handleCancelBooking}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "12px" }}
            >
              Cancel Booking
            </button>
          </div>
        )}

        <div className="glass-panel" style={{ marginBottom: "24px" }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2>Available Seats</h2>

            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search seat number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div
            className="flex gap-2"
            style={{ marginTop: "16px", flexWrap: "wrap" }}
          >
            {["all", "available", "standard", "stand", "pod"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
              </button>
            ))}
          </div>
        </div>

        {/* Floor Tabs */}
        <div
          className="flex gap-2"
          style={{ marginBottom: "16px", flexWrap: "wrap" }}
        >
          {["all", 0, 1, 2, 3].map((f) => (
            <button
              key={f}
              onClick={() => setFloorFilter(f)}
              className={`btn btn-sm ${floorFilter === f ? "btn-primary" : "btn-secondary"}`}
            >
              {f === "all" ? "All Floors" : f === 0 ? "Ground" : `Floor ${f}`}
            </button>
          ))}
        </div>

        <div className="seat-grid">
          {filteredSeats.map((seat) => (
            <div
              key={seat.id}
              className={`seat ${mapStatusToClass(seat.status)} type-${getSeatType(seat)}`}
              onClick={() => handleSeatClick(seat)}
              title={`${seat.seatNumber} - ${seat.status}`}
            >
              {getSeatLabel(seat)}
            </div>
          ))}
        </div>

        {filteredSeats.length === 0 && (
          <div
            className="glass-panel text-center"
            style={{ marginTop: "40px" }}
          >
            <h3>No seats found</h3>
            <p className="text-muted">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={quickBookAvailable}
          title="Quick Book"
        >
          <span className="tooltip">Quick Book</span>⚡
        </button>
        <button
          className="quick-action-btn"
          onClick={() => setFilter("available")}
          style={{ background: "var(--gradient-secondary)" }}
          title="Show Available"
        >
          <span className="tooltip">Show Available</span>
          🎯
        </button>
      </div>

      {/* Scroll to Top */}
      <button
        className={`scroll-to-top ${showScrollTop ? "visible" : ""}`}
        onClick={scrollToTop}
        style={{ bottom: "100px" }}
      >
        ↑
      </button>

      {showBookingModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowBookingModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Book Seat {selectedSeat?.seatNumber}</h3>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                value={bookingForm.startTime}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, startTime: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                value={bookingForm.endTime}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, endTime: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowBookingModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleBookingSubmit} className="btn btn-primary">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
