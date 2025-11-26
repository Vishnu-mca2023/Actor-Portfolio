// src/pages/ThemeContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    header_bg: "#111827",
    text_color: "#111827",
    heading_color: "#1f2937",
    subheading_color: "#4b5563",
    button_color: "#7c3aed",
    page_bg: "#f3f4f6",
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/api/admin";

  // Fetch theme from backend
  const fetchTheme = async () => {
    try {
      const res = await axios.get(`${API_BASE}/theme`);
      if (res.data) setTheme(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch theme:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update theme in backend and context
  const updateTheme = async (updatedTheme) => {
    try {
      const res = await axios.put(`${API_BASE}/theme/update`, updatedTheme);
      if (res.data?.theme) setTheme(res.data.theme);
    } catch (err) {
      console.error("❌ Failed to update theme:", err);
    }
  };

  // Reset theme to default
  const resetTheme = async () => {
    try {
      const res = await axios.post(`${API_BASE}/theme/reset`);
      if (res.data?.theme) setTheme(res.data.theme);
    } catch (err) {
      console.error("❌ Failed to reset theme:", err);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading theme...</p>;

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
