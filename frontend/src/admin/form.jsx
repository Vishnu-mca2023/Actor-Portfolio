
// src/admin/Form.jsx
import React, { useState } from "react";
import axios from "axios";
import MediaGallery from "./MediaGallery";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5000/api";

const Form = () => {
  const [title, setTitle] = useState("");
  const [adminTitle, setAdminTitle] = useState("");
  const [content, setContent] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [showGallery, setShowGallery] = useState(false);

  const handleMediaSelect = (url) => {
    setSelectedImage(url);
    setShowGallery(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        title,
        adminTitle,
        content,
        conclusion,
        image: selectedImage,
      };

      const res = await axios.post(`${API_BASE}/posts`, formData);
      toast.success("✅ Post created successfully!");
      console.log(res.data);

      // Reset form
      setTitle("");
      setAdminTitle("");
      setContent("");
      setConclusion("");
      setSelectedImage("");
    } catch (err) {
      console.error("❌ Error saving post:", err.message);
      toast.error("Error saving post");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md p-6 rounded-lg mt-10">
      {!showGallery ? (
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-4 text-center">📝 Add New Post</h2>

          <label className="block mb-2 font-medium">Title</label>
          <input
            type="text"
            className="w-full border p-2 mb-4 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="block mb-2 font-medium">Admin Title</label>
          <input
            type="text"
            className="w-full border p-2 mb-4 rounded"
            value={adminTitle}
            onChange={(e) => setAdminTitle(e.target.value)}
          />

          <label className="block mb-2 font-medium">Content</label>
          <textarea
            className="w-full border p-2 mb-4 rounded"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label className="block mb-2 font-medium">Conclusion</label>
          <textarea
            className="w-full border p-2 mb-4 rounded"
            rows="3"
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
          />

          <div className="mb-4">
            <label className="block font-medium mb-2">Thumbnail Image</label>
            {selectedImage ? (
              <div className="relative">
                <img
                  src={`http://localhost:5000${selectedImage}`}
                  alt="Selected"
                  className="w-48 rounded border"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage("")}
                  className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 text-xs rounded"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowGallery(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Choose from Media
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Save Post
          </button>
        </form>
      ) : (
        <MediaGallery onSelectMedia={handleMediaSelect} onBack={() => setShowGallery(false)} />
      )}
    </div>
  );
};

export default Form;




