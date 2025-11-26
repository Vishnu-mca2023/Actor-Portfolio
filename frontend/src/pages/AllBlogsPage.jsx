import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import { FaShareAlt, FaWhatsapp, FaEnvelope, FaCopy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:5000";

// CATEGORY COLORS
const getCategoryClasses = (category) => {
  switch ((category || "").toLowerCase()) {
    case "announcement":
      return "from-red-400 to-red-600 text-white";
    case "fitness":
      return "from-yellow-400 to-amber-500 text-black";
    case "highlights":
      return "from-indigo-500 to-purple-600 text-white";
    default:
      return "from-cyan-500 to-blue-600 text-white";
  }
};

const AllBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;

  const [shareModal, setShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 900, easing: "ease-in-out", once: true });
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/blogs`);
      setBlogs(res.data || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const openShareModal = (id) => {
    const url = `${window.location.origin}/blog/${id}`;
    setShareUrl(url);
    setShareModal(true);
  };

  const closeShareModal = () => setShareModal(false);

  const indexOfLast = currentPage * blogsPerPage;
  const indexOfFirst = indexOfLast - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(blogs.length / blogsPerPage));

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyLink = async (url) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // fallback
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      toast.success("Link copied!", {
        position: "top-center",
        autoClose: 1800,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        style: { background: "#16a34a", color: "#ffffff", fontWeight: 600 },
      });
    } catch (e) {
      console.error("Copy failed", e);
      toast.error("Unable to copy link", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  return (
    <main className="flex-grow bg-gradient-to-b from-white via-indigo-50 to-blue-100 py-20 px-6">
      {/* Toast container */}
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        <h1
          className="text-5xl font-extrabold text-center text-indigo-700 mb-14 tracking-tight drop-shadow-xl"
          data-aos="fade-down"
        >
          Explore All Blogs
        </h1>

        {loading ? (
          <div className="text-center text-gray-500 text-lg animate-pulse">
            Loading blogs...
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">No blogs available.</div>
        ) : (
          <>
            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentBlogs.map((blog, index) => (
                <div
                  key={blog.id || index}
                  data-aos="zoom-in-up"
                  data-aos-delay={index * 150}
                  className="group relative bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-700 cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03]"
                >
                  {/* Share Icon (small) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openShareModal(blog.id);
                    }}
                    className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white p-1 rounded-full shadow-md transition scale-90 hover:scale-100"
                    aria-label="Share post"
                    title="Share"
                  >
                    <FaShareAlt className="text-gray-700 text-[10px]" />
                  </button>

                  {/* MEDIA */}
                  <div
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    className="relative w-full h-64 overflow-hidden rounded-t-3xl"
                  >
                    {blog.media_path ? (
                      blog.media_path.endsWith(".mp4") ? (
                        <video
                          src={blog.media_path}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          muted
                          loop
                          autoPlay
                        />
                      ) : (
                        <img
                          src={blog.media_path}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-lg">
                        No Media
                      </div>
                    )}

                    {/* Category */}
                    <div className="absolute top-4 left-4" data-aos="fade-right">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full shadow-md bg-gradient-to-r ${getCategoryClasses(
                          blog.category
                        )} backdrop-blur-sm`}
                      >
                        {blog.category || "Custom"}
                      </span>
                    </div>

                    {blog.media_path && blog.media_path.endsWith(".mp4") && (
                      <span className="absolute top-4 left-24 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-semibold animate-pulse shadow-md">
                        VIDEO
                      </span>
                    )}
                  </div>

                  {/* CONTENT with AOS inside animations */}
                  <div
                    className="p-6"
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    data-aos="fade-up"
                  >
                    <h2
                      className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300"
                      data-aos="fade-up"
                      data-aos-delay="0"
                    >
                      {blog.title}
                    </h2>

                    <p
                      className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      {blog.short_description}
                    </p>

                    <div
                      className="text-right text-xs text-gray-400"
                      data-aos="fade-up"
                      data-aos-delay="400"
                    >
                      {blog.created_at &&
                        new Date(blog.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center mt-16 gap-5">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl"
                }`}
              >
                Previous
              </button>

              <span className="text-gray-900 text-lg font-semibold">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* SHARE MODAL */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-80 shadow-xl text-center">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Share Blog</h3>

            <div className="flex justify-center gap-10 mb-8">
              {/* WhatsApp */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
                      "_blank"
                    )
                  }
                  className="text-green-600 text-4xl hover:scale-125 transition"
                  title="Share via WhatsApp"
                >
                  <FaWhatsapp />
                </button>
                <span className="text-xs mt-2 text-gray-600">WhatsApp</span>
              </div>

              {/* Gmail */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    const subject = "🔥 Don't Miss This! Check this blog";
                    const body = `Hey,\n\nCheck this out:\n\n${shareUrl}\n\nThought you'd like it!`;
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=noreply@example.com&su=${encodeURIComponent(
                      subject
                    )}&body=${encodeURIComponent(body)}`;
                    window.open(gmailUrl, "_blank");
                  }}
                  className="text-blue-600 text-4xl hover:scale-125 transition"
                  title="Share via Gmail"
                >
                  <FaEnvelope />
                </button>
                <span className="text-xs mt-2 text-gray-600">Gmail</span>
              </div>

              {/* Copy */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleCopyLink(shareUrl)}
                  className="text-gray-700 text-4xl hover:scale-125 transition"
                  title="Copy link"
                >
                  <FaCopy />
                </button>
                <span className="text-xs mt-2 text-gray-600">Copy</span>
              </div>
            </div>

            <button
              onClick={closeShareModal}
              className="mt-4 px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default AllBlogsPage;
