
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineUpload, AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const MediaGallery = ({ onSelect }) => {
  const [mediaList, setMediaList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, file: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/media");
      setMediaList(res.data.reverse());
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load media!");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.warn("Please select a file!");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post("http://localhost:5000/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ File uploaded successfully!");
      setSelectedFile(null);
      setMediaList((prev) => [{ url: res.data.url, type: res.data.type }, ...prev]);
    } catch (err) {
      console.error(err);
      toast.error("❌ Upload failed!");
    }
  };

  const handleDelete = async () => {
    const file = deleteModal.file;
    const filename = file.url.split("/").pop();
    try {
      await axios.delete(`http://localhost:5000/api/media/${filename}`);
      toast.success("✅ Media deleted successfully!");
      setMediaList((prev) => prev.filter((m) => m.url !== file.url));
      setDeleteModal({ show: false, file: null });
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete media!");
      setDeleteModal({ show: false, file: null });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(mediaList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = mediaList.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }
    return pages;
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    hover: { scale: 1.05 },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Upload Section */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Media Gallery</h2>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="border border-gray-300 rounded-md p-2 w-48 sm:w-60"
          />
          <button
            onClick={handleUpload}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <AiOutlineUpload /> Upload
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {mediaList.length === 0 ? (
          <p className="text-gray-500 text-center">No media files uploaded yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {currentItems.map((file, index) => (
                  <motion.div
                    key={file.url}
                    className="relative group border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    layout
                    data-aos="zoom-in"
                    data-aos-delay={index * 50}
                  >
                    {file.type === "video" ? (
                      <video
                        src={`http://localhost:5000${file.url}`}
                        className="w-full h-32 object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={`http://localhost:5000${file.url}`}
                        alt="media"
                        className="w-full h-32 object-cover"
                      />
                    )}

                    {/* Select overlay */}
                    <div
                      className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition"
                      onClick={() => onSelect(`http://localhost:5000${file.url}`)}
                    >
                      Select
                    </div>

                    {/* Delete icon */}
                    <button
                      onClick={() => setDeleteModal({ show: true, file })}
                      className="absolute top-1 right-1 bg-red-600 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-700 transition text-xs"
                    >
                      <AiOutlineDelete />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Google-style Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-1 text-gray-700">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-purple-100 text-purple-700"
                  }`}
                >
                  Prev
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition ${
                      page === currentPage
                        ? "bg-purple-600 text-white shadow"
                        : page === "..."
                        ? "cursor-default"
                        : "hover:bg-purple-100 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-purple-100 text-purple-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this media?
            </h3>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, file: null })}
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
