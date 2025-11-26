import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HTMLReactParser from "html-react-parser";
import AOS from "aos";
import "aos/dist/aos.css";

const API_BASE = "http://localhost:5000";

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/blogs/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-600 animate-pulse">
        Loading blog...
      </div>
    );

  if (!post)
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        Blog Not Found!
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div
          className="mb-14 mt-6 text-center"
          data-aos="fade-down"
          data-aos-duration="1000"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 drop-shadow-lg">
            {post.title}
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Published on{" "}
            {new Date(post.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* MEDIA */}
        {post.media_path && (
          <div
            className="rounded-2xl overflow-hidden shadow-2xl mb-12 transform hover:scale-[1.01] transition-all duration-300"
            data-aos="zoom-in"
          >
            {post.media_path.endsWith(".mp4") ||
            post.media_path.endsWith(".webm") ? (
              <video
                src={post.media_path}
                controls
                className="w-full max-h-[400px] object-cover"
              />
            ) : (
              <img
                src={post.media_path}
                alt="Blog"
                className="w-full max-h-[400px] object-cover"
              />
            )}
          </div>
        )}

        {/* CONTENT CARD */}
        <div
          className="bg-white shadow-xl rounded-2xl p-10 md:p-14 leading-relaxed text-gray-800 backdrop-blur-xl"
          data-aos="fade-up"
        >
          <p className="text-xl italic font-medium text-gray-600 mb-8 border-l-4 border-purple-500 pl-4">
            {post.short_description}
          </p>

          <article className="prose prose-lg md:prose-xl max-w-none prose-purple prose-headings:text-gray-900 prose-img:rounded-xl prose-img:shadow-lg">
            {HTMLReactParser(post.content || "")}
          </article>

          {post.conclusion && (
            <div
              className="mt-16 pt-8 border-t border-gray-300"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h2 className="text-3xl font-bold text-purple-700 mb-4 drop-shadow-sm">
                Conclusion
              </h2>
              <p className="text-lg leading-relaxed text-gray-700">
                {post.conclusion}
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="mt-12 bg-purple-600 text-white p-8 rounded-2xl shadow-xl text-center text-xl font-semibold tracking-wide"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          ✨ Thanks for reading — Stay tuned for more premium blogs!
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
