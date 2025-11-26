import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const AddUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error("❌ Please fill all fields");

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "http://localhost:5000/api/auth/admin/add",
        { username, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Admin created successfully!");
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Failed to add admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-200 via-purple-300 to-purple-400 p-4">
      <Toaster position="top-right" reverseOrder={false} />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col lg:flex-row w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-white"
      >
        {/* Left: Add User Form */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center relative"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold mb-2 text-purple-700"
          >
            Add New Admin
          </motion.h2>
          <p className="text-sm md:text-base text-gray-500 mb-6">
            Enter username & password to create a new admin.
          </p>

          <form onSubmit={handleAddUser} className="space-y-4">
            <motion.input
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
            <motion.input
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#6B21A8" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex justify-center items-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Add Admin"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Right: Info Section */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full lg:w-1/2 bg-gradient-to-tr from-purple-600 to-purple-400 text-white flex flex-col justify-center p-8 lg:p-12 relative overflow-hidden mt-6 lg:mt-0 rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-2xl md:text-3xl font-bold mb-4"
          >
            Welcome! 🎉
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm md:text-base mb-6"
          >
            Use this panel to add new admin users and manage dashboard access.
          </motion.p>

          {/* Decorative animated shapes */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 0.95, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-purple-800 rotate-45 transform translate-x-12 translate-y-12 opacity-50 rounded-xl"
          ></motion.div>
          <motion.div
            animate={{ y: [0, -10, 10, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-purple-700 rounded-full opacity-40"
          ></motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AddUser;
