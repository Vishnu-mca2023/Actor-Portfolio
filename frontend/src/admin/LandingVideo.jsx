// src/admin/LandingVideo.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { ThemeContext } from "../pages/ThemeContext"; // Corrected import

const LandingVideo = () => {
  // =========================== STATE ===========================
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showVideoList, setShowVideoList] = useState(false);
  const [showBlogMode, setShowBlogMode] = useState(false);
  const [showLandingContent, setShowLandingContent] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState("");
  const [oldVideos, setOldVideos] = useState([]);
  const [blogMode, setBlogMode] = useState("static");

  const [landingContent, setLandingContent] = useState({
    heading: "",
    paragraph: "",
    tagline: "",
  });
  const [landingContentEdit, setLandingContentEdit] = useState({
    heading: "",
    paragraph: "",
    tagline: "",
  });

  const [aboutContent, setAboutContent] = useState("");
  const [aboutContentEdit, setAboutContentEdit] = useState("");
  const [aboutImage, setAboutImage] = useState(null);
  const [aboutImagePreview, setAboutImagePreview] = useState(null);
  const [existingAboutImage, setExistingAboutImage] = useState(null);

  const [themeColors, setThemeColors] = useState({
    primary_color: "#ff4d4d",
    secondary_color: "#4d79ff",
    background_color: "#ffffff",
    text_color: "#000000",
  });

  const API_BASE = "http://localhost:5000/api/admin";

  // =========================== FETCH INITIAL DATA ===========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Theme
        const themeRes = await axios.get(`${API_BASE}/theme`);
        if (themeRes.data) setThemeColors(themeRes.data);

        // Latest video
        const latest = await axios.get(`${API_BASE}/landing-video`, { responseType: "blob" });
        const blob = new Blob([latest.data], { type: latest.headers["content-type"] });
        setCurrentPreviewUrl(URL.createObjectURL(blob));

        // All videos
        const res = await axios.get(`${API_BASE}/all-videos`);
        const videos = await Promise.all(
          res.data.map(async (item) => {
            try {
              const blobRes = await axios.get(`${API_BASE}/landing-video/${item.id}`, { responseType: "blob" });
              const blob = new Blob([blobRes.data], { type: blobRes.headers["content-type"] });
              return { ...item, previewUrl: URL.createObjectURL(blob) };
            } catch {
              return { ...item, previewUrl: null };
            }
          })
        );
        setOldVideos(videos);

        // Blog mode
        const modeRes = await axios.get(`${API_BASE}/blog-view-mode`);
        setBlogMode(modeRes.data.mode || "static");

        // Landing content
        const contentRes = await axios.get(`${API_BASE}/landing-content`);
        const data = contentRes.data.data || { heading: "", paragraph: "", tagline: "" };
        setLandingContent(data);
        setLandingContentEdit(data);

        // About Us
        const aboutRes = await axios.get(`${API_BASE}/about-us`);
        const aboutData = aboutRes.data || {};
        setAboutContent(aboutData.content || "");
        setAboutContentEdit(aboutData.content || "");
        setExistingAboutImage(aboutData.image ? `http://localhost:5000${aboutData.image}` : null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch initial data");
      }
    };

    fetchData();
  }, []);

  // =========================== VIDEO UPLOAD ===========================
  const uploadNewVideo = async () => {
    if (!videoFile) return toast.warning("Please choose a video to upload");

    const MAX_SIZE_MB = 20;
    if (videoFile.size > MAX_SIZE_MB * 1024 * 1024) {
      return toast.error(`Video too large! Max: ${MAX_SIZE_MB}MB`);
    }

    const fd = new FormData();
    fd.append("video", videoFile);

    try {
      await axios.post(`${API_BASE}/upload-video`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Video uploaded!");
      setVideoFile(null);
      setShowUploadForm(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload video");
    }
  };

  const useOldVideo = async (id) => {
    try {
      await axios.post(`${API_BASE}/use-old-video`, { id });
      toast.success("Video updated successfully!");
      setShowVideoList(false);
      window.location.reload();
    } catch {
      toast.error("Failed to update video");
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE}/delete-video/${id}`);
      toast.success("Video deleted!");
      setOldVideos(oldVideos.filter((v) => v.id !== id));
    } catch {
      toast.error("Failed to delete video");
    }
  };

  // =========================== BLOG MODE ===========================
  const toggleBlogMode = async () => {
    const newMode = blogMode === "static" ? "swipe" : "static";
    try {
      await axios.post(`${API_BASE}/update-blog-view-mode`, { mode: newMode });
      setBlogMode(newMode);
      toast.success(`Blog mode changed to ${newMode}`);
      setShowBlogMode(false);
    } catch {
      toast.error("Failed to update blog mode");
    }
  };

  // =========================== LANDING CONTENT ===========================
  const updateLandingContent = async () => {
    try {
      const res = await axios.post(`${API_BASE}/landing-content`, landingContentEdit);
      toast.success("Landing page content updated!");
      setLandingContent(res.data.data);
      setShowLandingContent(false);
    } catch {
      toast.error("Failed to update landing content");
    }
  };

  // =========================== ABOUT US ===========================
  const updateAboutUs = async () => {
    try {
      const fd = new FormData();
      fd.append("content", aboutContentEdit);
      if (aboutImage) fd.append("image", aboutImage);

      const res = await axios.post(`${API_BASE}/about-us`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("About Us updated!");
      setAboutContent(aboutContentEdit);
      if (res.data.image) {
        setExistingAboutImage(`http://localhost:5000${res.data.image}`);
        setAboutImagePreview(null);
      }
      setAboutImage(null);
      setShowAboutUs(false);
    } catch {
      toast.error("Failed to update About Us");
    }
  };

  // =========================== THEME PICKER ===========================
  const updateTheme = async () => {
    try {
      const res = await axios.put(`${API_BASE}/theme/update`, themeColors);
      toast.success("Theme updated successfully!");
      setShowThemePicker(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update theme");
    }
  };

  // =========================== RENDER ===========================
  const themeStyle = {
    color: themeColors.text_color,
    backgroundColor: themeColors.background_color,
  };

  const primaryStyle = {
    backgroundColor: themeColors.primary_color,
    color: "#fff",
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen space-y-6" style={themeStyle}>
      {/* ================= TAB 1: VIDEO UPLOAD ================= */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold" style={{ color: themeColors.primary_color }}>Upload New Video</h2>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={primaryStyle}
          className="px-5 py-2 rounded-lg font-semibold"
        >
          {showUploadForm ? "Close Form" : "Edit / Upload"}
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full p-2 border rounded-lg" />
          <button onClick={uploadNewVideo} style={primaryStyle} className="px-5 py-2 rounded-lg font-semibold">
            Upload Video
          </button>
        </div>
      )}

      {/* ================= TAB 2: VIDEO LIST ================= */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold" style={{ color: themeColors.primary_color }}>View Hero Videos</h2>
        <button onClick={() => setShowVideoList(!showVideoList)} style={primaryStyle} className="px-5 py-2 rounded-lg font-semibold">
          {showVideoList ? "Close List" : "View Videos"}
        </button>
      </div>

      {showVideoList && (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-6">
          {currentPreviewUrl && (
            <video src={currentPreviewUrl} controls className="w-full rounded-lg shadow bg-black" />
          )}
          <Swiper modules={[Autoplay, Pagination]} spaceBetween={20} slidesPerView={1} pagination={{ clickable: true }} autoplay={{ delay: 3000 }}>
            {oldVideos.map((v) => (
              <SwiperSlide key={v.id}>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="relative w-full pb-[56.25%] bg-black rounded overflow-hidden">
                    {v.previewUrl ? (
                      <video src={v.previewUrl} controls className="absolute top-0 left-0 w-full h-full object-contain" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">No Preview</div>
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm">{v.filename}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => useOldVideo(v.id)} style={{ backgroundColor: themeColors.primary_color, color: "#fff" }} className="flex-1 py-1 rounded text-sm">
                      Select
                    </button>
                    <a href={`${API_BASE}/landing-video/${v.id}`} target="_blank" rel="noreferrer" style={{ backgroundColor: themeColors.secondary_color, color: "#fff" }} className="flex-1 py-1 rounded text-sm text-center">
                      Open
                    </a>
                    <button onClick={() => deleteVideo(v.id)} className="flex-1 bg-red-500 text-white py-1 rounded text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* ================= TAB 3: BLOG MODE ================= */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold" style={{ color: themeColors.primary_color }}>Blog Mode</h2>
        <button onClick={() => setShowBlogMode(!showBlogMode)} style={primaryStyle} className="px-5 py-2 rounded-lg font-semibold">
          {showBlogMode ? "Close" : "Edit Mode"}
        </button>
      </div>
      {showBlogMode && (
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
          <span className="text-gray-700 font-medium">Current Mode: {blogMode}</span>
          <button onClick={toggleBlogMode} style={primaryStyle} className="px-5 py-2 rounded-lg font-semibold">Toggle Mode</button>
        </div>
      )}

      {/* ================= TAB 4: LANDING CONTENT ================= */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold" style={{ color: themeColors.primary_color }}>Landing Page Content</h2>
        <button onClick={() => setShowLandingContent(!showLandingContent)} style={primaryStyle} className="px-5 py-2 rounded-lg font-semibold">
          {showLandingContent ? "Close" : "Edit Content"}
        </button>
      </div>
      {showLandingContent && (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
          <input type="text" maxLength={40} value={landingContentEdit.heading} placeholder="Heading" className="w-full p-3 border rounded-lg" onChange={(e) => setLandingContentEdit({ ...landingContentEdit, heading: e.target.value })} />
          <textarea maxLength={300} rows={4} value={landingContentEdit.paragraph} placeholder="Paragraph" className="w-full p-3 border rounded-lg" onChange={(e) => setLandingContentEdit({ ...landingContentEdit, paragraph: e.target.value })} />
          <input type="text" maxLength={80} value={landingContentEdit.tagline} placeholder="Tagline" className="w-full p-3 border rounded-lg" onChange={(e) => setLandingContentEdit({ ...landingContentEdit, tagline: e.target.value })} />
          <button onClick={updateLandingContent} style={{ backgroundColor: "#ffbb33", color: "#fff" }} className="px-5 py-2 rounded-lg font-semibold">Save Landing Content</button>
        </div>
      )}

      {/* ================= TAB 5: ABOUT US ================= */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold" style={{ color: themeColors.primary_color }}>About Us</h2>
        <button onClick={() => setShowAboutUs(!showAboutUs)} style={primaryStyle} className="px-5 py-2 rounded-lg font-semibold">{showAboutUs ? "Close" : "Edit About Us"}</button>
      </div>
      {showAboutUs && (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-6">
          <div>
            <h3 className="font-bold mb-2" style={{ color: themeColors.primary_color }}>Current / Uploaded Image</h3>
            {aboutImagePreview ? <img src={aboutImagePreview} className="w-48 h-48 rounded-xl object-cover border shadow" /> :
              existingAboutImage ? <img src={existingAboutImage} className="w-48 h-48 rounded-xl object-cover border shadow" /> :
                <p className="text-gray-500 italic">No image uploaded yet</p>}
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: themeColors.primary_color }}>Change Image</h3>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { setAboutImage(e.target.files[0]); setAboutImagePreview(URL.createObjectURL(e.target.files[0])); } }} className="w-full p-3 border rounded-lg shadow-sm" />
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: themeColors.primary_color }}>Edit Content</h3>
            <textarea value={aboutContentEdit} maxLength={850} rows={8} className="w-full p-4 border rounded-lg shadow-sm" onChange={(e) => setAboutContentEdit(e.target.value)} />
            <div className="text-right text-sm text-gray-500 mt-1">{aboutContentEdit.length} / 850</div>
          </div>
          <button onClick={updateAboutUs} style={{ backgroundColor: "#ffbb33", color: "#fff" }} className="px-6 py-3 rounded-xl shadow-md">Save Changes</button>
          <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
            <h3 className="font-bold mb-2" style={{ color: themeColors.primary_color }}>Current Saved Content</h3>
            <p>{aboutContent}</p>
          </div>
        </div>
      )}

      {/* ================= TAB 6: THEME PICKER ================= */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold" style={{ color: themeColors.primary_color }}>Theme Picker</h2>
        <button onClick={() => setShowThemePicker(!showThemePicker)} style={primaryStyle} className="px-5 py-2 rounded-lg font-semibold">
          {showThemePicker ? "Close" : "Edit Theme"}
        </button>
      </div>

      {showThemePicker && (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
          <div className="flex flex-col gap-3">
            <label>Primary Color</label>
            <input type="color" value={themeColors.primary_color} onChange={(e) => setThemeColors({ ...themeColors, primary_color: e.target.value })} />
          </div>
          <div className="flex flex-col gap-3">
            <label>Secondary Color</label>
            <input type="color" value={themeColors.secondary_color} onChange={(e) => setThemeColors({ ...themeColors, secondary_color: e.target.value })} />
          </div>
          <div className="flex flex-col gap-3">
            <label>Background Color</label>
            <input type="color" value={themeColors.background_color} onChange={(e) => setThemeColors({ ...themeColors, background_color: e.target.value })} />
          </div>
          <div className="flex flex-col gap-3">
            <label>Text Color</label>
            <input type="color" value={themeColors.text_color} onChange={(e) => setThemeColors({ ...themeColors, text_color: e.target.value })} />
          </div>
          <button onClick={updateTheme} style={{ backgroundColor: themeColors.primary_color, color: "#fff" }} className="px-6 py-2 rounded-lg font-semibold">
            Save Theme
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingVideo;
