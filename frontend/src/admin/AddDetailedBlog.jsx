import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddDetailedBlog = () => {
  const [title, setTitle] = useState("");
  const [adminTitle, setAdminTitle] = useState("");
  const [content, setContent] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [sections, setSections] = useState([{ title: "", text: "", media: null }]);

  // 🔹 Paste your handleSubmit function here
 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();

    // Basic info
    formData.append("title", title);
    formData.append("description", content);
    formData.append("full_content", conclusion);
    formData.append("category", "general");
    formData.append("blog_type", "full");

    // Add all sections and media
    const sectionData = sections.map((s, i) => ({
      title: s.title || "",
      text: s.text || "",
      media: s.media ? s.media.name : null,
    }));
    formData.append("sections", JSON.stringify(sectionData));

    // Append media files
    sections.forEach((s, i) => {
      if (s.media) formData.append(`section_media_${i}`, s.media);
    });

    const res = await axios.post("http://localhost:5000/api/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.message) {
      toast.success("✅ Blog added successfully!");
      setTitle("");
      setContent("");
      setConclusion("");
      setSections([{ title: "", text: "", media: null }]);
    }
  } catch (err) {
    console.error("❌ Error saving post:", err);
    toast.error("Error saving post!");
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog title" />
      {/* add rest of the fields and section inputs */}
      <button type="submit">Add Blog</button>
    </form>
  );
};

export default AddDetailedBlog;
