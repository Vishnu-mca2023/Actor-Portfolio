import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import AOS from "aos";

import "aos/dist/aos.css";
import "swiper/css";
import "swiper/css/pagination";

const API_BASE = "http://localhost:5000/api";
const ADMIN_API_BASE = "http://localhost:5000/api/admin";

const getCategoryClasses = (category) => {
  switch ((category || "").toLowerCase()) {
    case "announcement":
      return "bg-red-600";
    case "fitness":
      return "bg-yellow-500";
    case "highlights":
      return "bg-teal-600";
    default:
      return "bg-purple-600";
  }
};

const Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [blogMode, setBlogMode] = useState("swipe");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/blogs`);
      const mapped = (res.data || []).map((p) => ({
        ...p,
        media_path: p.media_path || null,
        created_at: p.created_at || new Date().toISOString(),
      }));
      setPosts(mapped);
    } catch (err) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogMode = async () => {
    try {
      const res = await axios.get(`${ADMIN_API_BASE}/blog-view-mode`);
      if (res?.data?.mode) setBlogMode(res.data.mode);
    } catch {}
  };

  useEffect(() => {
    fetchPosts();
    fetchBlogMode();
    AOS.init({ duration: 1200, once: false });
  }, []);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600 text-lg animate-pulse">
        Loading blogs...
      </div>
    );

  if (!posts.length)
    return (
      <div className="text-center mt-10 text-gray-600 text-lg">
        No posts available yet.
      </div>
    );

  const BlogCard = ({ post, index }) => (
    <div
      onClick={() => navigate(`/blog/${post.id}`)}
      data-aos="fade-up"
      data-aos-delay={index * 120}
      className="relative group cursor-pointer rounded-3xl overflow-hidden shadow-xl transition-transform duration-700 hover:-translate-y-1"
    >
      <div className="w-full h-80 relative overflow-hidden rounded-t-3xl">
        {post.media_path ? (
          post.media_path.endsWith(".mp4") ? (
            <video
              src={post.media_path}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              autoPlay
              muted
              loop
            />
          ) : (
            <img
              src={post.media_path}
              alt={post.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 bg-gray-200">
            No Media
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 text-white" data-aos="fade-right">
          <span
            className={`text-[12px] px-3 py-1 rounded-full font-semibold ${getCategoryClasses(
              post.category
            )}`}
          >
            {post.category || "custom"}
          </span>
        </div>

        <div className="absolute left-4 bottom-10 right-4 text-white">
          <h2
            data-aos="fade-left"
            className="text-xl font-bold leading-tight line-clamp-2 drop-shadow-lg"
          >
            {post.title}
          </h2>

          <p
            data-aos="fade-right"
            className="text-sm opacity-90 line-clamp-2 mt-2"
          >
            {post.short_description}
          </p>

          <p className="text-xs opacity-80 mt-2">
            📅{" "}
            {new Date(post.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-purple-100 via-indigo-100 to-purple-200">

      <h1
        data-aos="fade-down"
        className="text-4xl font-extrabold text-center mb-12 text-purple-900"
      >
        ✨ Latest <span className="text-purple-700">Blogs</span>
      </h1>

      {/* SWIPER MODE */}
      {blogMode === "swipe" ? (
        <div data-aos="zoom-in" className="relative">
          <Swiper
            spaceBetween={24}
            slidesPerView={3}
            loop={true}
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            speed={800}
            pagination={{ clickable: true, el: ".custom-pagination" }}
            modules={[Autoplay, Pagination]}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {posts.map((post, index) => (
              <SwiperSlide key={post.id}>
                <BlogCard post={post} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="custom-pagination mt-6 flex justify-center" />
        </div>
      ) : (
        /* STATIC MODE */
        <div
          data-aos="fade-up"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {posts.slice(0, 6).map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}

      {/* Bottom Button (Always Visible) */}
      <div className="flex justify-center mt-12" data-aos="fade-up">
        <button
          onClick={() => navigate("/All-blogs")}
          className="px-10 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          View More Blogs
        </button>
      </div>
    </div>
  );
};

export default Blogs;
