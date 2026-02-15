import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = ({ isAuthenticated = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="container nav-container">
          <Link to="/" className="logo">
            BookMySeat.
          </Link>

          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active-link" : ""}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/leaderboard"
                  className={`nav-link ${isActive("/leaderboard") ? "active-link" : ""}`}
                >
                  Leaderboard
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${isActive("/profile") ? "active-link" : ""}`}
                >
                  Profile
                </Link>
                {userProfile?.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`nav-link ${isActive("/admin") ? "active-link" : ""}`}
                  >
                    Admin
                  </Link>
                )}
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>
                {userProfile && (
                  <span className="text-muted">{userProfile.name}</span>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="#features" className="nav-link">
                  Features
                </a>
                <a href="#stats" className="nav-link">
                  Stats
                </a>
                <Link to="/leaderboard" className="nav-link">
                  Leaderboard
                </Link>
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>
                <Link to="/auth" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-nav-links">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active-link" : ""}`}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/leaderboard"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                Leaderboard
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${isActive("/profile") ? "active-link" : ""}`}
                onClick={closeMobileMenu}
              >
                Profile
              </Link>
              {userProfile?.role === "admin" && (
                <Link
                  to="/admin"
                  className={`nav-link ${isActive("/admin") ? "active-link" : ""}`}
                  onClick={closeMobileMenu}
                >
                  Admin Panel
                </Link>
              )}
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                style={{ width: "fit-content" }}
              >
                <span>{theme === "dark" ? "☀️" : "🌙"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "8px" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="#features"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                Features
              </a>
              <a href="#stats" className="nav-link" onClick={closeMobileMenu}>
                Stats
              </a>
              <Link
                to="/leaderboard"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                Leaderboard
              </Link>
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                style={{ width: "fit-content" }}
              >
                <span>{theme === "dark" ? "☀️" : "🌙"}</span>
              </button>
              <Link
                to="/auth"
                className="btn btn-primary"
                onClick={closeMobileMenu}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
