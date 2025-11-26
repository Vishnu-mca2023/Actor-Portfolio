// src/admin/ContactInfo.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineEdit } from "react-icons/ai";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaSave } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ContactInfo = () => {
  const [contact, setContact] = useState({
    address: "",
    phone: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [messagesList, setMessagesList] = useState([]);
  const [filter, setFilter] = useState("all"); // filter state
  const [saving, setSaving] = useState(false); // saving loader

  // ✅ Fetch existing contact info
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/contact");
        if (res.data) {
          setContact(res.data);
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
      }
    };
    fetchContact();
  }, []);

  // ✅ Fetch all messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/contact/messages");
        if (res.data && res.data.messages) {
          const sortedMessages = res.data.messages.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setMessagesList(sortedMessages.slice(0, 50));
        }
      } catch (err) {
        console.error("Error fetching contact messages:", err);
      }
    };
    fetchMessages();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  // ✅ Save updated contact info
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put("http://localhost:5000/api/contact", contact);

      if (res.data && res.data.contact) {
        setContact(res.data.contact); // ✅ update state with latest info
      }

      setMessage("✅ Contact Info Updated Successfully!");
      setShowContactForm(false); // close form after save
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating contact info:", err);
      setMessage("❌ Failed to update contact info");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Filter messages
  const filterMessages = () => {
    const now = new Date();
    return messagesList
      .filter((msg) => {
        const msgDate = new Date(msg.created_at);
        switch (filter) {
          case "today":
            return msgDate.toDateString() === now.toDateString();
          case "yesterday":
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            return msgDate.toDateString() === yesterday.toDateString();
          case "1hr":
            return now - msgDate <= 60 * 60 * 1000;
          case "2hr":
            return now - msgDate <= 2 * 60 * 60 * 1000;
          case "3hr":
            return now - msgDate <= 3 * 60 * 60 * 1000;
          default:
            return true;
        }
      })
      .slice(0, 5);
  };

  // --- Animation variants ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const formElementVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Box */}
      <motion.div
        className="bg-white p-5 rounded-lg shadow-md mb-6 flex items-center justify-between"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h2 className="text-2xl font-bold text-gray-800">Contact Info</h2>
        <button
          onClick={() => setShowContactForm(!showContactForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          <AiOutlineEdit size={20} />
          {showContactForm ? "Close Form" : "Edit Contact List"}
        </button>
      </motion.div>

      {/* Contact Info Form */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {message && (
              <motion.p
                className="mb-4 text-center font-semibold text-green-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {message}
              </motion.p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Address */}
              <motion.div
                variants={formElementVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <label className="block text-gray-700 font-medium flex items-center gap-2">
                  <FaMapMarkerAlt className="text-purple-600" /> Address
                </label>
                <textarea
                  name="address"
                  value={contact.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                  rows="3"
                  placeholder="Enter address"
                />
              </motion.div>

              {/* Phone and Email */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={formElementVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <div>
                  <label className="block text-gray-700 font-medium flex items-center gap-2">
                    <FaPhoneAlt className="text-purple-600" /> Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={contact.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium flex items-center gap-2">
                    <FaEnvelope className="text-purple-600" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contact.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                    placeholder="Enter email"
                  />
                </div>
              </motion.div>

              {/* Save Button */}
              <motion.button
                type="submit"
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: saving ? 1 : 1.05 }}
                whileTap={{ scale: saving ? 1 : 0.95 }}
              >
                {saving ? "Saving..." : <><FaSave /> Save Changes</>}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display Current Contact Info */}
      <AnimatePresence>
        {!showContactForm && (
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Current Contact Details
            </h3>
            <div className="space-y-3 text-gray-700">
              <motion.p
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <FaMapMarkerAlt className="text-purple-600" />
                <span>{contact.address || "Not available"}</span>
              </motion.p>
              <motion.p
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FaPhoneAlt className="text-purple-600" />
                <span>{contact.phone || "Not available"}</span>
              </motion.p>
              <motion.p
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FaEnvelope className="text-purple-600" />
                <span>{contact.email || "Not available"}</span>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last 5 Contact Messages Table */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Messages</h3>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Filter:</label>
            <select
              className="border rounded p-1 focus:outline-none focus:ring focus:ring-purple-300"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="1hr">Last 1 Hour</option>
              <option value="2hr">Last 2 Hours</option>
              <option value="3hr">Last 3 Hours</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Message</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {filterMessages().length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No messages found.
                  </td>
                </tr>
              ) : (
                filterMessages().map((msg, index) => (
                  <tr key={msg.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{msg.name}</td>
                    <td className="px-4 py-2 border">{msg.email}</td>
                    <td className="px-4 py-2 border">{msg.message}</td>
                    <td className="px-4 py-2 border">{new Date(msg.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactInfo;

