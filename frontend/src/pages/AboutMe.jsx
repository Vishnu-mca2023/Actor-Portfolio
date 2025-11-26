

import React, { useState, useEffect } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const AboutUs = () => {
  const [aboutData, setAboutData] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false); // controls fade in/out

  const API_BASE = "http://localhost:5000/api/admin";

  // Fetch About Data
  const fetchAboutUs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/about-us`);
      if (res.data) {
        const imageUrl = res.data.image
          ? `http://localhost:5000${res.data.image}?t=${new Date().getTime()}`
          : "";

        setAboutData({
          title: res.data.title || "About Us",
          content: res.data.content || "No content available.",
          image: imageUrl,
        });
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
      setAboutData({
        title: "Failed to load",
        content: "Could not load About Us content.",
        image: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUs();

    // Initialize AOS
    AOS.init({ duration: 1200, once: false });

    // Trigger fade-in after mount
    setVisible(true);

    // Fade out when component unmounts (navigating away)
    return () => {
      setVisible(false);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-white px-6 sm:px-12 py-20">

      {/* Center Main Title */}
      <div className="w-full flex justify-center mb-12" data-aos="fade-up">
        <h4 className="text-3xl sm:text-4xl font-extrabold text-purple-700 text-center font-roboto">
          About Us
        </h4>
      </div>

      {/* Main Content Section */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-14">

        {/* Left Image Section */}
        <div
          className={`flex justify-center md:justify-start -mt-6 md:-mt-10 transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={aboutData.image || "https://via.placeholder.com/600x400?text=No+Image"}
            alt="About"
            className="w-full md:w-auto h-auto object-contain"
          />
        </div>

        {/* Right Text Section */}
        <div
          className={`flex flex-col justify-center transition-opacity duration-1200 ${visible ? "opacity-100" : "opacity-0"}`}
          data-aos="fade-right"
          data-aos-delay="200"
        >
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
            {loading ? "Loading content..." : aboutData.content}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
