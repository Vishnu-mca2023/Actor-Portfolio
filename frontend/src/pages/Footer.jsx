import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Phone, Home, Facebook, Instagram, Twitter } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Footer = () => {
  const [contact, setContact] = useState({ address: "", phone: "", email: "" });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/contact");
        setContact(res.data);
      } catch (err) {
        console.error("❌ Error fetching contact info in footer:", err);
      }
    };
    fetchContact();
  }, []);

  const handleNav = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Logo / About */}
        <div data-aos="fade-up">
          <h2 className="text-2xl font-bold text-white">Vishnu</h2>
          <p className="mt-4 text-sm leading-6">
            Building modern web experiences with passion and user-focused design.
          </p>
        </div>

        {/* Quick Links */}
        <div data-aos="fade-up" data-aos-delay="100">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <button onClick={() => handleNav("home")} className="hover:text-white duration-200">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => handleNav("about")} className="hover:text-white duration-200">
                About Us
              </button>
            </li>
            <li>
              <button onClick={() => handleNav("blogs")} className="hover:text-white duration-200">
                Blogs
              </button>
            </li>
            <li>
              <button onClick={() => handleNav("contact")} className="hover:text-white duration-200">
                Contact Us
              </button>
            </li>
          </ul>
        </div>

        {/* Dynamic Contact Info */}
        <div data-aos="fade-up" data-aos-delay="200">
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <div className="flex items-center gap-3 mb-3">
            <Mail size={18} /> 
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-white transition-colors duration-200"
            >
              {contact.email || "Loading..."}
            </a>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Phone size={18} /> 
            <a
              href={`tel:${contact.phone}`}
              className="hover:text-white transition-colors duration-200"
            >
              {contact.phone || "Loading..."}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Home size={18} /> <span>{contact.address || "Loading..."}</span>
          </div>
        </div>

        {/* Social Media Links */}
        <div data-aos="fade-up" data-aos-delay="300">
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a
              href="https://facebook.com/Vishnu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 duration-200"
            >
              <Facebook />
            </a>
            <a
              href="https://instagram.com/Vishnu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 duration-200"
            >
              <Instagram />
            </a>
            <a
              href="https://twitter.com/Vishnu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 duration-200"
            >
              <Twitter />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-10 border-t border-gray-700 pt-5 text-center text-sm" data-aos="fade-up" data-aos-delay="400">
        © {new Date().getFullYear()} Vishnu. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
