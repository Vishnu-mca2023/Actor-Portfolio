import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoType, setLogoType] = useState(null);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Track admin login status
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsLoggedIn(!!token);

    const handleStorageChange = () => {
      const token = localStorage.getItem("adminToken");
      setIsLoggedIn(!!token);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Smooth show/hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollingUp(currentY < lastScrollY.current || currentY < 50);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch logo directly in Header to reduce lag
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logoRes = await axios.get("http://localhost:5000/api/admin/landing-logo", {
          responseType: "blob",
        });
        const mimeType = logoRes.headers["content-type"];
        const logoBlob = new Blob([logoRes.data], { type: mimeType });
        setLogoUrl(URL.createObjectURL(logoBlob));
        setLogoType(mimeType);
      } catch (err) {
        console.error("Error loading logo:", err);
      }
    };
    fetchLogo();
  }, []);

  // Admin button
  const handleAdminClick = () => {
    navigate(isLoggedIn ? "/admin-dashboard" : "/admin-login");
  };

  // Unified navigation
  const handleNavigate = (e, id, path = "/") => {
    e.preventDefault();
    setMenuOpen(false);

    if (location.pathname !== path) {
      navigate(path);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "blogs", label: "Blogs" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
        scrollingUp ? "translate-y-0" : "-translate-y-full"
      } shadow-md`}
      style={{
        background: "linear-gradient(to right, #a855f7, #9333ea, #6366f1)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 text-white">
        {/* Logo */}
        {logoUrl && logoType ? (
          logoType.startsWith("image/") ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 w-auto object-contain rounded-md cursor-pointer"
              onClick={() => navigate("/")}
            />
          ) : (
            <video
              src={logoUrl}
              autoPlay
              loop
              muted
              className="h-10 w-auto object-contain rounded-md cursor-pointer"
              onClick={() => navigate("/")}
            />
          )
        ) : (
          <div className="h-10 w-24 bg-gray-500 animate-pulse rounded-md"></div> // placeholder for instant UI
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 font-semibold">
          {navItems.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleNavigate(e, id)}
              className="hover:text-purple-200 transition"
            >
              {label}
            </a>
          ))}
          <button
            onClick={handleAdminClick}
            className="hover:text-purple-200 transition font-semibold"
          >
            Admin
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-purple-700 text-white px-6 py-4 space-y-3 text-center font-semibold">
          {navItems.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleNavigate(e, id)}
              className="block hover:text-purple-200 transition"
            >
              {label}
            </a>
          ))}
          <button
            onClick={handleAdminClick}
            className="w-full hover:text-purple-200 transition"
          >
            Admin
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
