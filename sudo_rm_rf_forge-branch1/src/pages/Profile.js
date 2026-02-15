import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import bookingService from "../services/bookingService";

const ACHIEVEMENTS = [
  {
    id: "first_booking",
    name: "First Step",
    description: "Complete your first booking",
    icon: "🎯",
    xp: 50,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Book a seat before 8 AM",
    icon: "🌅",
    xp: 100,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Book a seat after 8 PM",
    icon: "🦉",
    xp: 100,
  },
  {
    id: "streak_3",
    name: "3-Day Streak",
    description: "Book seats for 3 consecutive days",
    icon: "🔥",
    xp: 150,
  },
  {
    id: "marathon",
    name: "Marathon",
    description: "Study for 4+ hours in one session",
    icon: "⏱️",
    xp: 200,
  },
  {
    id: "century",
    name: "Century Club",
    description: "Complete 100 bookings",
    icon: "💯",
    xp: 500,
  },
];

const Profile = () => {
  const { userProfile, getUserProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      await getUserProfile();
      const userBookings = await bookingService.getUserBookings();
      const userPenalties = await bookingService.getPenalties();
      setBookings(userBookings);
      setPenalties(userPenalties);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusBadge = (status) => {
    const map = {
      COMPLETED: { class: "badge-success", label: "Completed" },
      CANCELLED: { class: "badge-primary", label: "Cancelled" },
      NO_SHOW: { class: "badge-gold", label: "No Show" },
      ADMIN_FREED: { class: "badge-primary", label: "Admin Freed" },
    };
    return map[status] || { class: "badge-primary", label: status };
  };

  // Stats from bookings
  const stats = {
    totalBookings: bookings.filter((b) => b.status === "COMPLETED").length,
    totalMinutes: bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.duration || 0), 0),
    totalXP: bookings.reduce((sum, b) => sum + (b.xpEarned || 0), 0),
    noShows: penalties.length,
  };

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div
          className="container"
          style={{ paddingTop: "120px", textAlign: "center" }}
        >
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <p className="loader-text">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isAuthenticated={true} />

      <div
        className="container"
        style={{ paddingTop: "120px", paddingBottom: "60px" }}
      >
        {/* Profile Header */}
        <div className="glass-panel" style={{ marginBottom: "40px" }}>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{ marginBottom: "8px" }}>
                {userProfile?.name || "User"}
              </h1>
              <p className="text-muted">{userProfile?.email}</p>
              <div
                className="flex gap-2"
                style={{ marginTop: "16px", flexWrap: "wrap" }}
              >
                <span className="badge badge-primary">
                  {userProfile?.rollNumber}
                </span>
                <span className="badge badge-gold">
                  {stats.totalXP > 0 ? `${stats.totalXP} XP` : "0 XP"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-4 gap-6"
          style={{ marginBottom: "40px" }}
        >
          <div className="glass-panel text-center">
            <div className="stat-value">{stats.totalXP.toLocaleString()}</div>
            <div className="stat-label">Total XP</div>
          </div>
          <div className="glass-panel text-center">
            <div className="stat-value text-teal">
              {formatDuration(stats.totalMinutes)}
            </div>
            <div className="stat-label">Focus Time</div>
          </div>
          <div className="glass-panel text-center">
            <div className="stat-value text-gold">{stats.totalBookings}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="glass-panel text-center">
            <div
              className="stat-value"
              style={{ color: "var(--accent-danger)" }}
            >
              {stats.noShows}
            </div>
            <div className="stat-label">No Shows</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2" style={{ marginBottom: "24px" }}>
          <button
            onClick={() => setActiveTab("history")}
            className={`btn btn-sm ${activeTab === "history" ? "btn-primary" : "btn-secondary"}`}
          >
            📚 Booking History
          </button>
          <button
            onClick={() => setActiveTab("penalties")}
            className={`btn btn-sm ${activeTab === "penalties" ? "btn-primary" : "btn-secondary"}`}
          >
            ⚠️ Penalties ({penalties.length})
          </button>
        </div>

        {/* Booking History */}
        {activeTab === "history" && (
          <div className="glass-panel">
            <h2 style={{ marginBottom: "24px" }}>📚 Booking History</h2>
            {bookings.length > 0 ? (
              <div>
                {bookings.map((booking, index) => {
                  const badge = getStatusBadge(booking.status);
                  return (
                    <div
                      key={booking.id || index}
                      className="flex justify-between items-center"
                      style={{
                        padding: "16px",
                        borderBottom:
                          index < bookings.length - 1
                            ? "1px solid var(--border-color)"
                            : "none",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                          Seat {booking.seatNumber}
                          <span
                            className={`badge ${badge.class}`}
                            style={{ marginLeft: "8px" }}
                          >
                            {badge.label}
                          </span>
                        </p>
                        <p
                          className="text-muted"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {formatDate(booking.startTime)} -{" "}
                          {new Date(booking.endTime).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </p>
                        {booking.duration > 0 && (
                          <p
                            className="text-teal"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Duration: {formatDuration(booking.duration)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {booking.xpEarned !== 0 && (
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: "1.125rem",
                              color:
                                booking.xpEarned > 0
                                  ? "var(--accent-gold)"
                                  : "var(--accent-danger)",
                            }}
                          >
                            {booking.xpEarned > 0 ? "+" : ""}
                            {booking.xpEarned} XP
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted text-center">
                No bookings yet. Visit the dashboard to book your first seat!
              </p>
            )}
          </div>
        )}

        {/* Penalties */}
        {activeTab === "penalties" && (
          <div className="glass-panel">
            <h2 style={{ marginBottom: "24px" }}>⚠️ No-Show Penalties</h2>
            {penalties.length > 0 ? (
              <div>
                {penalties.map((penalty, index) => (
                  <div
                    key={penalty.id || index}
                    className="flex justify-between items-center"
                    style={{
                      padding: "16px",
                      borderBottom:
                        index < penalties.length - 1
                          ? "1px solid var(--border-color)"
                          : "none",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                        Seat {penalty.seatNumber}
                        <span
                          className="badge badge-gold"
                          style={{ marginLeft: "8px" }}
                        >
                          No Show
                        </span>
                      </p>
                      <p
                        className="text-muted"
                        style={{ fontSize: "0.875rem" }}
                      >
                        {formatDate(penalty.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 700,
                          color: "var(--accent-danger)",
                        }}
                      >
                        {penalty.xpEarned} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center">
                No penalties! Keep up the good attendance! 🎉
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
