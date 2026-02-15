import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const data = await api.get("/auth/me");
          setCurrentUser(data.user);
          setUserProfile(data.user);
        } catch (error) {
          console.error("Auth check failed:", error);
          api.clearToken();
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Sign up
  const signup = async (userData) => {
    try {
      const { name, email, password, rollNumber } = userData;
      const data = await api.post("/auth/signup", {
        name,
        email,
        password,
        rollNumber,
      });

      // Don't auto-login after signup, let them login manually
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const data = await api.post("/auth/login", { email, password });

      // Store token
      if (data.token) {
        api.setToken(data.token);
      }

      setCurrentUser(data.user);
      setUserProfile(data.user);

      return { user: data.user, profile: data.user };
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Still logout locally even if API call fails
      console.error("Logout API error:", error);
    }
    api.clearToken();
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Get user profile (refresh)
  const getUserProfile = async () => {
    try {
      const data = await api.get("/auth/me");
      setUserProfile(data.user);
      return data.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    getUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
