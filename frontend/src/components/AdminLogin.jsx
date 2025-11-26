
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const AdminLogin = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) navigate("/admin-dashboard");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/admin/login", {
        username,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("adminToken", token);
      if (setToken) setToken(token);

      // Redirect immediately after successful login
      navigate("/admin-dashboard");
    } catch (err) {
      console.error(err.response?.data?.message || "Login failed");
      alert(err.response?.data?.message || "Login failed"); // simple alert instead of toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f1c3f] via-[#1a2a5a] to-[#0a1833] overflow-hidden">
      {/* Floating gradient blobs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${100 + i * 60}px`,
            height: `${100 + i * 60}px`,
            background: `radial-gradient(circle at 30% 30%, ${
              ["#ffffff", "#a3c4ff", "#e0e7ff", "#cbd5e1"][i]
            }, transparent)`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
          }}
          animate={{
            x: [0, 40 - i * 10, -40 + i * 10, 0],
            y: [0, -20 + i * 5, 20 - i * 5, 0],
            rotate: [0, 45, -45, 0],
          }}
          transition={{ duration: 25 + i * 5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Login Form */}
      <motion.form
        onSubmit={handleLogin}
        className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-3xl w-80 sm:w-96 flex flex-col gap-5 shadow-2xl border border-white/20"
        initial={{ opacity: 0, y: -60, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
          Admin Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="p-3 rounded-xl border border-white/30 bg-white/10 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white transition"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-3 rounded-xl border border-white/30 bg-white/10 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white transition"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-white/20 text-white py-2 rounded-xl font-semibold mt-2 hover:bg-white/30 transition-all duration-300"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            "Login"
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-white/80 text-center mt-3 hover:underline text-sm sm:text-base"
        >
          ← Go Back to Home
        </button>
      </motion.form>
    </div>
  );
};

export default AdminLogin;




// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";

// const AdminLogin = ({ setIsLoggedIn }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   // Redirect if already logged in
//   useEffect(() => {
//     const token = localStorage.getItem("adminToken");
//     if (token) {
//       setIsLoggedIn(true); // ensure header updates on refresh
//       navigate("/admin-dashboard");
//     }
//   }, [navigate, setIsLoggedIn]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:5000/api/auth/admin/login", {
//         username,
//         password,
//       });

//       const token = res.data.token;
//       localStorage.setItem("adminToken", token);
//       setIsLoggedIn(true); // ✅ Update header live
//       toast.success("Login Successful!");
//       navigate("/admin-dashboard");
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-6">
//       <form
//         onSubmit={handleLogin}
//         className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl flex flex-col gap-6"
//       >
//         <h2 className="text-3xl font-bold text-center text-indigo-700">Admin Login</h2>

//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           required
//         />

//         <button
//           type="submit"
//           className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md"
//         >
//           Login
//         </button>

//         <button
//           type="button"
//           onClick={() => navigate("/")}
//           className="text-indigo-600 font-medium hover:underline text-center mt-2"
//         >
//           ← Go Back to Home
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AdminLogin;
