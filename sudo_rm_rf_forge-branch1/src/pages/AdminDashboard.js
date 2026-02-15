import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("scanner");
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [rollNumberInput, setRollNumberInput] = useState("");
  const [seats, setSeats] = useState([]);
  const [entryLogs, setEntryLogs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [config, setConfig] = useState({});
  const [configForm, setConfigForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (activeTab === "seats") loadSeats();
    if (activeTab === "logs") loadLogs();
    if (activeTab === "bookings") loadBookings();
  }, [activeTab]);

  const handleBarcodeScan = async (rollNumber) => {
    if (!rollNumber || scanLoading) return;

    setScanLoading(true);
    setScanResult(null);

    try {
      const data = await api.post("/admin/barcode-scan", {
        rollNumber: rollNumber.trim(),
      });
      setScanResult({
        type: "success",
        action: data.action,
        message: data.message,
        seatNumber: data.seatNumber,
        duration: data.duration,
      });
    } catch (error) {
      setScanResult({
        type: "error",
        message: error.message || "Scan failed",
      });
    } finally {
      setScanLoading(false);
      setRollNumberInput("");
    }
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    handleBarcodeScan(rollNumberInput);
  };

  const loadSeats = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/seats");
      setSeats(data.seats || []);
    } catch (error) {
      console.error("Error loading seats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/logs");
      setEntryLogs(data.logs || []);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/bookings");
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const data = await api.get("/admin/config");
      setConfig(data.config || {});
      setConfigForm(data.config || {});
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const handleFreeAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to free ALL seats? This will end all active sessions.",
      )
    )
      return;

    try {
      const data = await api.post("/admin/free-all");
      alert(data.message);
      loadSeats();
    } catch (error) {
      alert(error.message || "Failed to free seats");
    }
  };

  const handleConfigSave = async (e) => {
    e.preventDefault();
    try {
      const data = await api.put("/admin/config", configForm);
      setConfig(data.config);
      alert("Configuration saved!");
    } catch (error) {
      alert(error.message || "Failed to save config");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const tabs = [
    { id: "scanner", label: "📋 Entry/Exit", icon: "📋" },
    { id: "logs", label: "📋 Entry Logs", icon: "📋" },
    { id: "seats", label: "🪑 Seats", icon: "🪑" },
    { id: "bookings", label: "📚 Bookings", icon: "📚" },
    { id: "config", label: "⚙️ Config", icon: "⚙️" },
  ];

  return (
    <>
      <Navbar isAuthenticated={true} />

      <div
        className="container"
        style={{ paddingTop: "120px", paddingBottom: "60px" }}
      >
        <div
          className="flex justify-between items-center"
          style={{ marginBottom: "32px" }}
        >
          <div>
            <h1>Admin Dashboard</h1>
            <p className="text-muted">Library Management Panel</p>
          </div>
          <div className="flex gap-2">
            <span className="badge badge-primary">
              {config.openingTime} - {config.closingTime}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="admin-tabs"
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${activeTab === tab.id ? "btn-primary" : "btn-secondary"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scanner Tab */}
        {activeTab === "scanner" && (
          <div className="glass-panel">
            <h2 style={{ marginBottom: "24px" }}>📋 Entry / Exit</h2>
            <p className="text-muted" style={{ marginBottom: "24px" }}>
              Enter a student's roll number to mark entry or exit. First
              submission marks entry, second marks exit.
            </p>

            {/* Manual Input */}
            <form
              onSubmit={handleManualScan}
              style={{ maxWidth: "400px", margin: "0 auto" }}
            >
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input"
                    value={rollNumberInput}
                    onChange={(e) => setRollNumberInput(e.target.value)}
                    placeholder="Enter roll number..."
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={scanLoading || !rollNumberInput}
                    className="btn btn-primary"
                  >
                    {scanLoading ? "..." : "Submit"}
                  </button>
                </div>
              </div>
            </form>

            {/* Scan Result */}
            {scanResult && (
              <div
                style={{
                  maxWidth: "400px",
                  margin: "24px auto 0",
                  padding: "20px",
                  borderRadius: "var(--radius-lg)",
                  background:
                    scanResult.type === "success"
                      ? scanResult.action === "ENTRY"
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(99, 102, 241, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  border: `1px solid ${
                    scanResult.type === "success"
                      ? scanResult.action === "ENTRY"
                        ? "var(--accent-success)"
                        : "var(--accent-primary)"
                      : "var(--accent-danger)"
                  }`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                  {scanResult.type === "success"
                    ? scanResult.action === "ENTRY"
                      ? "✅"
                      : "👋"
                    : "❌"}
                </div>
                <h3 style={{ marginBottom: "4px" }}>
                  {scanResult.type === "success" ? scanResult.action : "Error"}
                </h3>
                <p style={{ marginBottom: "8px" }}>{scanResult.message}</p>
                {scanResult.seatNumber && (
                  <p className="text-muted">Seat: {scanResult.seatNumber}</p>
                )}
                {scanResult.duration !== undefined && (
                  <p className="text-muted">
                    Duration: {scanResult.duration} mins
                  </p>
                )}
                <button
                  onClick={() => setScanResult(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: "12px" }}
                >
                  Enter Another
                </button>
              </div>
            )}
          </div>
        )}

        {/* Entry/Exit Logs Tab */}
        {activeTab === "logs" && (
          <div className="glass-panel">
            <div
              className="flex justify-between items-center"
              style={{ marginBottom: "24px" }}
            >
              <h2>📋 Entry/Exit Logs</h2>
              <button onClick={loadLogs} className="btn btn-secondary btn-sm">
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="text-center">
                <div
                  className="loader-spinner"
                  style={{ margin: "20px auto" }}
                ></div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll Number</th>
                      <th>Seat</th>
                      <th>Entry Time</th>
                      <th>Exit Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entryLogs.length > 0 ? (
                      entryLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.user?.name || "-"}</td>
                          <td>{log.rollNumber}</td>
                          <td>{log.seatNumber || "-"}</td>
                          <td>{formatDate(log.entryTime)}</td>
                          <td>
                            {log.exitTime ? formatDate(log.exitTime) : "-"}
                          </td>
                          <td>
                            <span
                              className={`badge ${log.exitTime ? "badge-success" : "badge-gold"}`}
                            >
                              {log.exitTime ? "Exited" : "Inside"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center" }}>
                          No logs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Seats Tab */}
        {activeTab === "seats" && (
          <div className="glass-panel">
            <div
              className="flex justify-between items-center"
              style={{ marginBottom: "24px" }}
            >
              <h2>🪑 Seat Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={loadSeats}
                  className="btn btn-secondary btn-sm"
                >
                  Refresh
                </button>
                <button
                  onClick={handleFreeAll}
                  className="btn btn-sm"
                  style={{ background: "var(--accent-danger)", color: "white" }}
                >
                  Free All Seats
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center">
                <div
                  className="loader-spinner"
                  style={{ margin: "20px auto" }}
                ></div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Seat #</th>
                      <th>Floor</th>
                      <th>Status</th>
                      <th>Booked By</th>
                      <th>Start Time</th>
                      <th>Expiry Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seats.map((seat) => (
                      <tr key={seat.id}>
                        <td style={{ fontWeight: 600 }}>{seat.seatNumber}</td>
                        <td>{seat.floorNumber}</td>
                        <td>
                          <span
                            className={`badge ${
                              seat.status === "FREE"
                                ? "badge-success"
                                : seat.status === "PENDING"
                                  ? "badge-gold"
                                  : "badge-primary"
                            }`}
                          >
                            {seat.status}
                          </span>
                        </td>
                        <td>
                          {seat.bookedBy
                            ? `${seat.bookedBy.name} (${seat.bookedByRollNumber})`
                            : "-"}
                        </td>
                        <td>
                          {seat.startTime ? formatDate(seat.startTime) : "-"}
                        </td>
                        <td>
                          {seat.expiryTime ? formatDate(seat.expiryTime) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="glass-panel">
            <div
              className="flex justify-between items-center"
              style={{ marginBottom: "24px" }}
            >
              <h2>📚 Booking Logs</h2>
              <button
                onClick={loadBookings}
                className="btn btn-secondary btn-sm"
              >
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="text-center">
                <div
                  className="loader-spinner"
                  style={{ margin: "20px auto" }}
                ></div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll Number</th>
                      <th>Seat</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length > 0 ? (
                      bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.user?.name || "-"}</td>
                          <td>{booking.rollNumber}</td>
                          <td>{booking.seatNumber}</td>
                          <td>{formatDate(booking.startTime)}</td>
                          <td>{formatDate(booking.endTime)}</td>
                          <td>{booking.duration}m</td>
                          <td>
                            <span
                              className={`badge ${
                                booking.status === "COMPLETED"
                                  ? "badge-success"
                                  : booking.status === "NO_SHOW"
                                    ? "badge-gold"
                                    : "badge-primary"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td
                            style={{
                              color:
                                booking.xpEarned >= 0
                                  ? "var(--accent-success)"
                                  : "var(--accent-danger)",
                            }}
                          >
                            {booking.xpEarned > 0 ? "+" : ""}
                            {booking.xpEarned}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center" }}>
                          No bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Config Tab */}
        {activeTab === "config" && (
          <div className="glass-panel">
            <h2 style={{ marginBottom: "24px" }}>⚙️ Library Configuration</h2>
            <form onSubmit={handleConfigSave} style={{ maxWidth: "500px" }}>
              <div className="form-group">
                <label className="form-label">Opening Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={configForm.openingTime || ""}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      openingTime: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Closing Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={configForm.closingTime || ""}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      closingTime: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Max Booking Duration (minutes)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={configForm.maxBookingDuration || ""}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      maxBookingDuration: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Min Booking Duration (minutes)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={configForm.minBookingDuration || ""}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      minBookingDuration: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Grace Period (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={configForm.graceMinutes || ""}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      graceMinutes: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">No-Show Penalty XP</label>
                <input
                  type="number"
                  className="form-input"
                  value={configForm.noShowPenaltyXP || ""}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      noShowPenaltyXP: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Save Configuration
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
