import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header from "../components/Header";
import AOS from "aos";
import "aos/dist/aos.css";

const LandingPage = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoType, setLogoType] = useState("");
  const [landingContent, setLandingContent] = useState(null);
  const [isBright, setIsBright] = useState(false);
  const [offsetY, setOffsetY] = useState(0);
  const videoRef = useRef(null);

  // Smooth Parallax Scroll
  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY * 0.3);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch video and logo
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [videoRes, logoRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/landing-video", { responseType: "blob" }),
          axios.get("http://localhost:5000/api/admin/landing-logo", { responseType: "blob" }),
        ]);

        const videoBlob = new Blob([videoRes.data], { type: "video/mp4" });
        const mimeType = logoRes.headers["content-type"];
        const logoBlob = new Blob([logoRes.data], { type: mimeType });

        setVideoUrl(URL.createObjectURL(videoBlob));
        setLogoUrl(URL.createObjectURL(logoBlob));
        setLogoType(mimeType);
      } catch (err) {
        console.error("Error loading media:", err);
      }
    };
    fetchMedia();
  }, []);

  // Fetch landing content
  useEffect(() => {
    const fetchLandingContent = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/landing-content");
        setLandingContent(res.data.data || { heading: "", paragraph: "", tagline: "" });
      } catch (err) {
        console.error("Error fetching landing content:", err);
      }
    };
    fetchLandingContent();
  }, []);

  // Detect video brightness
  useEffect(() => {
    const checkBrightness = () => {
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 32;
      canvas.height = 18;
      ctx.drawImage(video, 0, 0, 32, 18);
      const frame = ctx.getImageData(0, 0, 32, 18);
      let sum = 0;
      for (let i = 0; i < frame.data.length; i += 4) {
        const avg = (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
        sum += avg;
      }
      const brightness = sum / (frame.data.length / 4);
      setIsBright(brightness > 130);
    };

    const interval = setInterval(checkBrightness, 2000);
    return () => clearInterval(interval);
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-in-out-cubic",
      once: false,
      mirror: true,
    });
  }, []);

  if (!landingContent) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  // Dynamic blur + fade intensity
  const blurIntensity = Math.min(offsetY / 120, 6);
  const opacity = Math.max(1 - offsetY / 800, 0.4);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      <Header logoUrl={logoUrl} logoType={logoType} />

      {/* Background Video */}
      {videoUrl && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Soft overlay for readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-0"></div>

      {/* Parallax Text Section */}
      <div
        className={`relative z-10 text-center px-6 sm:px-10 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh] transition-colors duration-500 ${
          isBright ? "text-gray-900" : "text-white"
        }`}
        style={{
          transform: `translateY(${offsetY * 0.3}px)`,
          filter: `blur(${blurIntensity}px)`,
          opacity: opacity,
          transition: "transform 0.25s ease-out, filter 0.3s ease, opacity 0.3s ease",
        }}
      >
        {/* Heading Animation - from left */}
        <h1
          data-aos="fade-right"
          className="text-4xl sm:text-5xl md:text-6xl font-bold drop-shadow-xl leading-tight mb-4 tracking-tight"
        >
          {landingContent.heading}
        </h1>

        {/* Paragraph Animation - from right */}
        <p
          data-aos="fade-left"
          data-aos-delay="200"
          className="text-base sm:text-lg md:text-xl drop-shadow-md mb-4"
        >
          {landingContent.paragraph}
        </p>

        {/* Tagline Animation - from bottom */}
        <p
          data-aos="fade-up"
          data-aos-delay="400"
          className="text-sm sm:text-base md:text-lg opacity-90"
        >
          {landingContent.tagline}
        </p>

        {/* Scroll Indicator */}
        <div data-aos="fade-up" data-aos-delay="800" className="mt-8 animate-bounce">
          <span
            className={`inline-block w-6 h-6 border-b-2 border-r-2 rotate-45 ${
              isBright ? "border-gray-800" : "border-white"
            }`}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 