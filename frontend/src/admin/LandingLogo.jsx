
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineUpload, AiOutlineEye } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";

const LandingLogo = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [oldLogos, setOldLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLogos, setShowLogos] = useState(false);

  const API_BASE = "http://localhost:5000/api/admin";

  // ✅ Fetch all old logos
  const fetchOldLogos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/all-logos`);
      setOldLogos(res.data || []);
    } catch (error) {
      console.error("Error fetching old logos:", error);
      toast.error("Failed to load old logos");
    }
  };

  useEffect(() => {
    fetchOldLogos();
  }, []);

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "video/mp4",
      "video/webm",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Only PNG, JPG, GIF, or MP4/WEBM files are allowed");
      return;
    }

    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ✅ Upload new logo
  const handleUpload = async () => {
    if (!logoFile) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/upload-logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Logo uploaded successfully!");
      setLogoFile(null);
      setPreviewUrl("");
      fetchOldLogos();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload logo");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Set an old logo as active
  const handleSelectOldLogo = async (id) => {
    try {
      await axios.post(`${API_BASE}/use-old-logo`, { id });
      toast.success("✅ Old logo applied as current!");
      fetchOldLogos();
    } catch (error) {
      console.error("Error selecting old logo:", error);
      toast.error("Failed to apply old logo");
    }
  };

  // --- Animation variants ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen text-gray-800">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <motion.div
        className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-800">Page Logo</h2>

        <button
          onClick={() => setShowLogos(!showLogos)}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition w-full sm:w-auto"
        >
          <AiOutlineEye size={20} />
          {showLogos ? "Hide Logos" : "View Uploaded Logos"}
        </button>
      </motion.div>

      {/* Upload New Logo */}
      <motion.div
        className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center sm:text-left">
          Upload New Logo
        </h3>

        <input
          type="file"
          accept="image/*,video/mp4,video/webm"
          onChange={handleFileChange}
          className="mb-4 block w-full text-sm"
        />

        {/* Preview */}
        {previewUrl && (
          <motion.div
            className="mt-3 flex justify-center sm:justify-start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {logoFile?.type.startsWith("video") ? (
              <video
                src={previewUrl}
                controls
                autoPlay
                loop
                muted
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border"
              />
            )}
          </motion.div>
        )}

        <div className="flex justify-center sm:justify-start">
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`mt-4 px-6 py-2 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload Logo"}
          </button>
        </div>
      </motion.div>

      {/* Old Logos Section */}
      <AnimatePresence>
        {showLogos && (
          <motion.div
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-5xl mx-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center sm:text-left">
              Uploaded Logos
            </h3>

            {oldLogos.length === 0 ? (
              <p className="text-gray-500 text-center">No logos uploaded yet.</p>
            ) : (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                initial="hidden"
                animate="visible"
                variants={logoVariants}
                transition={{ staggerChildren: 0.1 }}
              >
                {oldLogos.map((logo) => (
                  <motion.div
                    key={logo.id}
                    className="p-3 border rounded-lg flex flex-col items-center justify-center transition hover:shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Image or Video Preview */}
                    {logo.filename.endsWith(".mp4") ||
                    logo.filename.endsWith(".webm") ? (
                      <video
                        src={`${API_BASE}/landing-logo/${logo.id}`}
                        autoPlay
                        loop
                        muted
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                      />
                    ) : (
                      <img
                        src={`${API_BASE}/landing-logo/${logo.id}`}
                        alt="Logo"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                      />
                    )}

                    <button
                      onClick={() => handleSelectOldLogo(logo.id)}
                      className="mt-2 px-3 py-1 rounded-md text-xs sm:text-sm bg-purple-600 text-white hover:bg-purple-700 transition"
                    >
                      Use This
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingLogo;
