import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import FroalaEditorComponent from "react-froala-wysiwyg";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import MediaGallery from "./MediaGallery";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react"; // optional; install if you want Lottie animation

import "froala-editor/js/plugins.pkgd.min.js";
import "froala-editor/js/plugins/code_view.min.js";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/js/plugins/video.min.js";
import "froala-editor/js/plugins/link.min.js";
import "froala-editor/js/plugins/paragraph_format.min.js";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
import "react-toastify/dist/ReactToastify.css";

/**
 * NOTES:
 * - API_BASE should point to your backend.
 * - For Lottie: put a json animation at src/assets/lottie/pencil.json (or change the import path below)
 *   and run: npm install lottie-react
 * - This component preserves your original endpoints and logic, and restores draft modal & unsaved checks.
 */

const API_BASE = "http://localhost:5000";

// Optional: import a Lottie JSON (create the file or replace path with your file)
let pencilAnimation = null;
try {
  // If you have an animation json at this path, it will load; otherwise lottie will be null and we skip rendering it.
  // Put your lottie file at src/assets/lottie/pencil.json
  // eslint-disable-next-line import/no-unresolved
  pencilAnimation = require("../assets/lottie/pencil.json");
} catch (e) {
  pencilAnimation = null;
}

const AddPost = ({ setBlocking, setDraftCallback, onCountsChange }) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    content: "",
    conclusion: "",
    category: "announcement",
    customCategory: ""
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [editId, setEditId] = useState(null);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false); // used as "Do you want to save draft?"
  const [showUnsavedModal, setShowUnsavedModal] = useState(false); // confirmation when closing form with unsaved changes
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Helper: category -> gradient classes for badge
 const getCategoryClasses = (category) => {
  switch ((category || "").toLowerCase()) {
    case "announcement":
      return "bg-red-500 text-white";
    case "fitness":
      return "bg-yellow-500 text-black";
    case "highlights":
      return "bg-indigo-500 text-white"; // changed from teal to indigo
    case "custom":
    default:
      return "bg-cyan-500 text-white";
  }
};

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      const publishedRes = await axios.get(`${API_BASE}/api/blogs`);
      const draftsRes = await axios.get(`${API_BASE}/api/blogs/drafts/admin`);
      setPublishedPosts(publishedRes.data || []);
      setDraftPosts(draftsRes.data || []);

      if (onCountsChange) {
        const blogCount = (publishedRes.data || []).length;
        const imageCount = (publishedRes.data || []).filter(
          (p) =>
            p.media_path &&
            !p.media_path.endsWith(".mp4") &&
            !p.media_path.endsWith(".webm")
        ).length;
        const videoCount = (publishedRes.data || []).filter(
          (p) => p.media_path && (p.media_path.endsWith(".mp4") || p.media_path.endsWith(".webm"))
        ).length;
        onCountsChange({ blogs: blogCount, images: imageCount, videos: videoCount });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch posts.");
    }
  }, [onCountsChange]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Pagination/filtering
  const totalPages = Math.max(1, Math.ceil(publishedPosts.length / postsPerPage));
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = publishedPosts
    .filter((post) =>
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.category || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(indexOfFirst, indexOfLast);

  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  // Froala Config
  const froalaConfig = useMemo(() => ({
    placeholderText: "Write your content here...",
    heightMin: 250,
    charCounterCount: false,
    toolbarInline: false,
    quickInsertEnabled: false,
    toolbarButtons: [
      "bold", "italic", "underline", "|",
      "formatOL", "formatUL", "|",
      "insertImage", "insertVideo", "insertLink", "|",
      "html", "undo", "redo"
    ],
  }), []);

  // Expose blocking prop to parent to prevent navigation if there are unsaved changes
  useEffect(() => {
    if (setBlocking) {
      const hasUnsaved =
        isDirty &&
        (formData.title || formData.short_description || formData.content || mediaPreview);
      setBlocking(hasUnsaved);
    }
  }, [isDirty, formData, mediaPreview, setBlocking]);

  // Expose a callback to parent to trigger save-as-draft modal (keeps original behavior)
  useEffect(() => {
    if (setDraftCallback) {
      setDraftCallback(() => () => {
        const hasContent =
          formData.title || formData.short_description || formData.content || mediaPreview;
        if (hasContent) setShowDraftModal(true);
      });
    }
  }, [formData, mediaPreview, setDraftCallback]);

  // Unsaved warning on browser tab close
  useEffect(() => {
    const onBeforeUnload = (e) => {
      const hasUnsaved = isDirty && (formData.title || formData.short_description || formData.content || mediaPreview);
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, formData, mediaPreview]);

  // Input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target.result);
    reader.readAsDataURL(file);
    setIsDirty(true);
  };

  const handleGallerySelect = (url) => {
    setMediaPreview(url);
    setMediaFile(null);
    setShowGallery(false);
    setIsDirty(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      short_description: "",
      content: "",
      conclusion: "",
      category: "announcement",
      customCategory: ""
    });
    setMediaFile(null);
    setMediaPreview("");
    setEditId(null);
    setIsDirty(false);
  };

  // Save function (draft or publish)
  const savePost = async (isDraft, navigateAfter = null) => {
    const hasContent =
      formData.title || formData.short_description || formData.content || mediaPreview;

    if (!isDraft && (!formData.title || !formData.short_description || !formData.content)) {
      toast.error("⚠️ Please fill all required fields to publish!");
      return false;
    }

    if (!hasContent && isDraft) {
      toast.error("⚠️ Nothing to save as draft!");
      setShowDraftModal(false);
      return false;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title || "");
      data.append("short_description", formData.short_description || "");
      data.append("content", formData.content || "");
      data.append("conclusion", formData.conclusion || "");
      data.append("category", formData.category || "");
      data.append("customCategory", formData.customCategory || "");
      if (mediaFile) data.append("mediaFile", mediaFile);
      else if (mediaPreview) data.append("mediaPreview", mediaPreview);
      data.append("is_draft", isDraft);

      if (editId) {
        await axios.put(`${API_BASE}/api/blogs/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(isDraft ? "📝 Draft updated!" : "✅ Post updated!");
      } else {
        await axios.post(`${API_BASE}/api/blogs`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(isDraft ? "📝 Draft saved!" : "✅ Post added!");
      }

      resetForm();
      setShowForm(false);
      setShowDraftModal(false);
      setShowUnsavedModal(false);
      fetchPosts();
      if (navigateAfter) navigateAfter();
      return true;
    } catch (err) {
      console.error(err);
      toast.error(isDraft ? "❌ Failed to save draft!" : "❌ Failed to save post!");
      return false;
    }
  };

  const handleSubmit = async (e) => { e.preventDefault(); await savePost(false); };
  const handleSaveDraft = async () => {
    const ok = await savePost(true);
    if (ok) setShowDraftModal(false);
  };

  // Editing existing post
  const handleEdit = (post) => {
    setFormData({
      title: post.title || "",
      short_description: post.short_description || "",
      content: post.content || "",
      conclusion: post.conclusion || "",
      category: post.category ? (["announcement","fitness","highlights"].includes(post.category.toLowerCase()) ? post.category.toLowerCase() : "custom") : "announcement",
      customCategory: post.category && !["announcement","fitness","highlights"].includes((post.category || "").toLowerCase()) ? post.category : ""
    });
    setMediaPreview(post.media_path || "");
    setMediaFile(null);
    setEditId(post.id);
    setShowForm(true);
    setIsDirty(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(`${API_BASE}/api/blogs/${deleteId}`);
      toast.success("🗑️ Blog deleted!");
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete blog!");
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handlePreview = (id) => navigate(`/blog/${id}`);

  const truncateText = (text, length = 100) => text?.length > length ? text.substring(0, length) + "..." : text;

  // UI animation variants
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, hover: { scale: 1.03 } };
  const formVariants = { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };
  const modalVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  // When user tries to toggle/close form, check unsaved changes
  const attemptToggleForm = () => {
    const hasContent = formData.title || formData.short_description || formData.content || mediaPreview;
    if (showForm && isDirty && hasContent) {
      // show confirmation modal: Save / Discard / Cancel
      setShowUnsavedModal(true);
      return;
    }
    // otherwise toggle normally
    setShowForm((s) => {
      const next = !s;
      if (!next) resetForm();
      return next;
    });
  };

  // Unsaved modal actions
  const handleUnsavedSave = async () => {
    const ok = await savePost(true);
    if (ok) setShowUnsavedModal(false);
  };
  const handleUnsavedDiscard = () => {
    resetForm();
    setShowUnsavedModal(false);
    setShowForm(false);
  };
  const handleUnsavedCancel = () => {
    setShowUnsavedModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" />

      {/* Header + Add */}
      <div
        className="flex justify-between items-center mb-6 bg-white/60 backdrop-blur-md 
             p-4 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-wide">Manage Blog Posts</h2>
          <span className="text-sm text-gray-500 hidden md:inline">{publishedPosts.length} published • {draftPosts.length} drafts</span>
        </div>

        <motion.button
          onClick={() => attemptToggleForm()}
          whileHover={{ scale: 1.06, boxShadow: "0 0 18px rgba(147,51,234,0.85)" }}
          whileTap={{ scale: 0.96 }}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white 
               bg-gradient-to-r from-purple-600 to-purple-700
               shadow-md hover:shadow-purple-300 transition-all"
        >
          {showForm ? "Close Form" : "➕ Add Post"}
        </motion.button>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative"
        >
          <span className="absolute left-4 top-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.65 5.65a7.5 7.5 0 0010.6 10.6z" />
            </svg>
          </span>

          <input
            type="text"
            placeholder="Search posts by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 
                     shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 
                     transition-all bg-white/70 backdrop-blur-sm"
          />
        </motion.div>
      </div>

      {/* Form (Upgraded animations + refined UI + Lottie + neon hover + small buttons) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative mb-10"
            data-aos="fade-up"
            data-aos-duration="900"
            data-aos-easing="ease-out-cubic"
          >
            {/* Premium Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-4xl bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  {/* Lottie - optional */}
                  {pencilAnimation && (
                    <div className="w-12 h-12">
                      <Lottie animationData={pencilAnimation} loop={true} />
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-extrabold text-purple-700">Create / Edit Post</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Write a great post — add media, choose category, publish or save as draft.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => attemptToggleForm()}
                  className="text-sm px-3 py-1 rounded-full bg-white/60 border border-white/30 hover:bg-white"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                {/* Title */}
                <input
                  type="text"
                  name="title"
                  placeholder="Compelling Title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-purple-200"
                />

                {/* Short Description */}
                <textarea
                  name="short_description"
                  placeholder="Short description"
                  value={formData.short_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 shadow-sm resize-none focus:ring-2 focus:ring-purple-200"
                />

                {/* Category with icons + micro-animations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="col-span-2 w-full border border-gray-200 rounded-xl p-3 bg-white/70 focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="announcement">📢 Announcement</option>
                    <option value="fitness">💪 Fitness</option>
                    <option value="highlights">✨ Highlights</option>
                    <option value="custom">🧩 Custom</option>
                  </select>

                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 shadow-sm"
                  >
                    Category
                  </motion.span>
                </div>

                {formData.category === "custom" && (
                  <input
                    type="text"
                    name="customCategory"
                    placeholder="Enter custom category"
                    value={formData.customCategory}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3"
                  />
                )}

                {/* Froala Editor */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/80">
                  <FroalaEditorComponent
                    tag="textarea"
                    model={formData.content}
                    onModelChange={(content) =>
                      setFormData((prev) => ({ ...prev, content }))
                    }
                    config={{
                      ...froalaConfig,
                      heightMin: 300,
                      toolbarButtons: [
                        "bold", "italic", "underline", "|",
                        "formatOL", "formatUL", "|",
                        "insertImage", "insertVideo", "insertLink", "|",
                        "html", "undo", "redo"
                      ],
                    }}
                  />
                </div>

                {/* Conclusion */}
                <input
                  type="text"
                  name="conclusion"
                  placeholder="Conclusion (optional)"
                  value={formData.conclusion}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3"
                />

                {/* Media Upload Row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white/70 border border-gray-200 rounded-xl shadow-sm hover:shadow-md text-sm">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V4a4 4 0 014-4h0a4 4 0 014 4v3"></path>
                      </svg>
                      <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                      Upload Media
                    </label>

                    <motion.button
                      type="button"
                      onClick={() => setShowGallery(true)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white/70 shadow-sm hover:shadow-md text-sm"
                    >
                      Select Gallery
                    </motion.button>
                  </div>

                  {/* Preview */}
                  <div>
                    {mediaPreview ? (
                      mediaPreview.endsWith(".mp4") || mediaPreview.endsWith(".webm") ? (
                        <video src={mediaPreview} controls className="w-36 h-20 rounded-md object-cover border border-gray-200" />
                      ) : (
                        <img src={mediaPreview} alt="preview" className="w-36 h-20 rounded-md object-cover border border-gray-200" />
                      )
                    ) : (
                      <span className="text-sm text-gray-500">No media selected</span>
                    )}
                  </div>
                </div>

                {/* Buttons (reduced size + neon-glow publish button) */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end mt-2">
                  <motion.button
                    type="button"
                    onClick={() => setShowDraftModal(true)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 font-semibold shadow-sm hover:shadow-md text-sm"
                  >
                    Save Draft
                  </motion.button>

                  {/* Publish button with neon-glow hover */}
                  <motion.button
                    type="submit"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold shadow-md text-sm"
                    style={{ boxShadow: "0 6px 18px rgba(99, 102, 241, 0.25)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 30px rgba(147,51,234,0.9)";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 18px rgba(99, 102, 241, 0.25)";
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    {editId ? "Update Post" : "Publish Post"}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={resetForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-xl bg-transparent border border-gray-300 text-gray-600 text-sm"
                  >
                    Reset
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
{/* Drafts (keeps original layout but without category) */}
{draftPosts.length > 0 && (
  <>
    <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">Drafts</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {draftPosts.map((post) => (
        <motion.div
          key={post.id}
          className="relative flex flex-col bg-yellow-50 rounded-xl shadow-md overflow-hidden"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          {/* DRAFT Badge */}
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow">
            DRAFT
          </div>

          {/* Removed Category Badge completely */}

          {/* Media Preview */}
          {post.media_path &&
            (post.media_path.endsWith(".mp4") || post.media_path.endsWith(".webm") ? (
              <video
                src={post.media_path}
                controls
                className="w-full h-48 object-cover"
              />
            ) : (
              <img
                src={post.media_path}
                alt="Draft"
                className="w-full h-48 object-cover"
              />
            ))}

          <div className="flex flex-col flex-grow p-4">
            <h4 className="text-lg font-semibold text-purple-700 mb-2 line-clamp-2">
              {post.title || "Untitled Draft"}
            </h4>

            <p className="text-gray-600 text-sm flex-grow mb-4 line-clamp-3">
              {truncateText(post.short_description || "No description", 120)}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
              <button
                onClick={() => handleEdit(post)}
                className="flex-1 bg-green-500 text-white py-1 rounded-md hover:bg-green-600 transition"
              >
                Edit
              </button>

              <button
                onClick={() => confirmDelete(post.id)}
                className="flex-1 bg-red-500 text-white py-1 rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </>
)}

      {/* Draft Modal (confirmation to save) */}
      <AnimatePresence>
        {showDraftModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <motion.div
              className="bg-white p-6 rounded-xl w-[80%] max-w-md relative"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
            >
              <h3 className="text-lg font-bold mb-4">Save Draft</h3>
              <p className="mb-4">Do you want to save this post as a draft?</p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowDraftModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved confirmation modal (Save / Discard / Cancel) */}
      <AnimatePresence>
        {showUnsavedModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <motion.div
              className="bg-white p-6 rounded-xl w-[90%] max-w-md relative"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
            >
              <h3 className="text-lg font-bold mb-3">Unsaved Changes</h3>
              <p className="mb-4">You have unsaved content. Would you like to save it as a draft before leaving?</p>

              <div className="flex justify-end gap-2">
                <button onClick={handleUnsavedCancel} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">
                  Cancel
                </button>

                <button onClick={handleUnsavedDiscard} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  Discard
                </button>

                <button onClick={handleUnsavedSave} className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                  Save Draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      

      {/* Published Posts */}
      <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">Published Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentPosts.map((post) => (
          <motion.div
            key={post.id}
            className="relative flex flex-col bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ duration: 0.3 }}
          >
            {/* Media Section */}
            <div className="relative w-full h-56 sm:h-48 lg:h-56 overflow-hidden rounded-t-3xl">
              {post.media_path &&
                (post.media_path.endsWith(".mp4") || post.media_path.endsWith(".webm") ? (
                  <video src={post.media_path} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={post.media_path} alt="Post" className="w-full h-full object-cover" />
                ))}

              {/* Media badge */}
              {post.media_path &&
                (post.media_path.endsWith(".mp4") || post.media_path.endsWith(".webm")) && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-semibold">VIDEO</span>
                )}

              {/* Category Badge */}
              <div className="absolute top-3 right-3">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getCategoryClasses(post.category)}`}>
                  {post.category || "custom"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-5">
              <h4 className="text-lg font-bold text-purple-700 mb-2 line-clamp-2">{post.title}</h4>
              <p className="text-gray-700 text-sm flex-grow mb-4 line-clamp-4">{truncateText(post.short_description, 140)}</p>

              {/* Hover Overlay for Buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-all duration-300 rounded-3xl p-5">
                <button onClick={() => handleEdit(post)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md">Edit</button>
                <button onClick={() => confirmDelete(post.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md">Delete</button>
                <button onClick={() => handlePreview(post.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md">Preview</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-10 gap-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`px-6 py-2 rounded-lg font-medium ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-6 py-2 rounded-lg font-medium ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300"
          }`}
        >
          Next
        </button>
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-[80%] max-w-3xl relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                className="absolute top-2 right-3 text-gray-600 hover:text-red-600"
                onClick={() => setShowGallery(false)}
              >
                ✕
              </button>
              <MediaGallery onSelect={handleGallerySelect} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial="hidden" animate="visible" exit="exit" variants={modalVariants}
          >
            <motion.div className="bg-white p-6 rounded-xl w-[90%] max-w-sm" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <h3 className="text-lg font-bold mb-3">Delete Post</h3>
              <p className="mb-4">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDeleteModal(false)} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button onClick={handleDeleteConfirmed} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AddPost;





















