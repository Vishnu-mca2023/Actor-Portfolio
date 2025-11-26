import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import HTMLReactParser from "html-react-parser";

const BASE_URL = "http://localhost:5000"; // ✅ Base URL for media

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/blogs/${id}`);
        setBlog(res.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-red-500">
        Blog not found.
      </div>
    );
  }

  // ✅ Fix media path for correct full URL
  const fullMediaPath =
    blog.media_path?.startsWith("http")
      ? blog.media_path
      : `${BASE_URL}${blog.media_path}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-white to-purple-50 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* ✅ Show Image or Video */}
        {blog.media_path && (
          fullMediaPath.match(/\.(mp4|mov|webm|avi|mkv)$/i) ? (
            <video
              src={fullMediaPath}
              controls
              className="w-full h-64 md:h-80 object-cover"
            />
          ) : (
            <img
              src={fullMediaPath}
              alt="Media"
              className="w-full h-64 md:h-80 object-cover"
            />
          )
        )}

        <div className="p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-700 mb-2">
            {blog.title}
          </h1>

          <p className="text-gray-600 mb-6 italic">
            {blog.short_description}
          </p>

          <div className="text-gray-800 leading-relaxed mb-6">
            {HTMLReactParser(blog.content)}
          </div>

          {blog.conclusion && (
            <div className="border-t border-purple-200 pt-6">
              <h3 className="text-2xl font-bold text-purple-700 mb-3">
                Conclusion
              </h3>
              <p className="text-gray-800 leading-relaxed">{blog.conclusion}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BlogDetails;
