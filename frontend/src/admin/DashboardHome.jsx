import React, { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaFileAlt, FaImage, FaVideo, FaPlusCircle, FaEdit, FaTrashAlt } from "react-icons/fa";

const DashboardHome = () => {
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    totalBlogs: 0,
    totalImages: 0,
    totalVideos: 0,
  });

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchSummary();
    fetchActivities();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/summary");
      setSummary(res.data);
    } catch (err) {
      console.error("❌ Error fetching summary:", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/activities");
      setActivities(res.data.slice(0, 5));
    } catch (err) {
      console.error("❌ Error fetching activities:", err);
    }
  };

  const summaryBoxes = [
    { label: "Total Blogs", count: summary.totalBlogs, color: "bg-gradient-to-r from-indigo-500 to-purple-600", icon: <FaFileAlt className="text-4xl text-white" /> },
    { label: "Images", count: summary.totalImages, color: "bg-gradient-to-r from-green-400 to-teal-500", icon: <FaImage className="text-4xl text-white" /> },
    { label: "Videos", count: summary.totalVideos, color: "bg-gradient-to-r from-pink-500 to-red-500", icon: <FaVideo className="text-4xl text-white" /> },
  ];

  const getActivityStyle = (action) => {
    switch (action?.toLowerCase()) {
      case "created":
        return { border: "border-l-4 border-green-500", icon: <FaPlusCircle className="text-green-500 text-xl" /> };
      case "updated":
        return { border: "border-l-4 border-yellow-500", icon: <FaEdit className="text-yellow-500 text-xl" /> };
      case "deleted":
        return { border: "border-l-4 border-red-500", icon: <FaTrashAlt className="text-red-500 text-xl" /> };
      default:
        return { border: "border-l-4 border-gray-300", icon: <FaFileAlt className="text-gray-400 text-xl" /> };
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-purple-50 min-h-screen space-y-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryBoxes.map((box, i) => (
          <motion.div
            key={i}
            data-aos={i % 2 === 0 ? "fade-up" : "fade-down"}
            data-aos-delay={i * 100}
            className={`${box.color} p-6 rounded-2xl shadow-lg flex items-center justify-between transform hover:scale-105 transition-all duration-300`}
          >
            <div>
              <h2 className="text-lg font-semibold text-white opacity-90">{box.label}</h2>
              <p className="text-3xl font-bold text-white mt-2">
                <CountUp end={box.count} duration={2} separator="," />
              </p>
            </div>
            <div>{box.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* ===== Recent Activities ===== */}
      <motion.div
        data-aos="fade-up"
        data-aos-delay="300"
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activities (Last 5)</h2>

        {activities.length === 0 ? (
          <p className="text-gray-500 italic">No recent activities yet.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((act, idx) => {
              const { border, icon } = getActivityStyle(act.action_type);
              return (
                <motion.div
                  key={act.id || idx}
                  className={`flex items-start gap-4 p-4 rounded-xl shadow-md ${border} bg-white hover:shadow-xl transition duration-300`}
                  data-aos={idx % 2 === 0 ? "fade-right" : "fade-left"}
                  data-aos-delay={idx * 100}
                >
                  <div className="mt-1">{icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold capitalize">{act.action_type}</h3>
                    <p className="text-gray-600 text-sm">{act.description}</p>
                    <p className="text-gray-400 text-xs mt-1">{new Date(act.created_at).toLocaleString()}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardHome;
