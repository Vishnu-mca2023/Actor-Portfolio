
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const path = require("path");
// const fs = require("fs");
// const pool = require("./config/db");

// // Initialize Express App
// const app = express();

// // Import Routes

// const authRoutes = require("./routes/authRoutes");
// const contactRoutes = require("./routes/contact");
// const adminRoutes = require("./routes/admin");
// const activityRoutes = require("./routes/activityRoutes");
// const mediaRoutes = require("./routes/media");
// const blogModeRoutes = require("./routes/blogModeRoutes");
// const blogsRoute = require("./routes/blogs");
// const landingContentRoutes = require("./routes/landingContentRoutes");

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // -----------------------------------------------
// //  Ensure /media folder exists
// // -----------------------------------------------
// const mediaPath = path.join(__dirname, "media");
// if (!fs.existsSync(mediaPath)) {
//   fs.mkdirSync(mediaPath, { recursive: true });
//   console.log("📁 Media folder created automatically");
// }

// // Serve static media folder
// app.use("/media", express.static(mediaPath));

// // -----------------------------------------------
// // ⭐ Ensure /uploads folder exists (IMPORTANT)
// // -----------------------------------------------
// const uploadsPath = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsPath)) {
//   fs.mkdirSync(uploadsPath, { recursive: true });
//   console.log("📁 Uploads folder created automatically");
// }

// // Serve static uploads folder (FOR ABOUT US IMAGE)
// app.use("/uploads", express.static(uploadsPath));

// // -----------------------------------------------
// // API Routes
// // -----------------------------------------------
// app.use("/api/auth", authRoutes);
// app.use("/api/contact", contactRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/activities", activityRoutes);
// app.use("/api/media", mediaRoutes);
// app.use("/api", blogModeRoutes);
// app.use("/api/blogs", blogsRoute);
// app.use("/api/admin/landing-content", landingContentRoutes);


// // -----------------------------------------------
// // Create default admin
// // -----------------------------------------------
// const createDefaultAdmin = async () => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM admins WHERE username=$1",
//       ["admin"]
//     );

//     if (result.rows.length === 0) {
//       const hashedPassword = await bcrypt.hash("admin123", 10);
//       await pool.query(
//         "INSERT INTO admins (username, password) VALUES ($1, $2)",
//         ["admin", hashedPassword]
//       );
//       console.log("✅ Default admin created: username=admin | password=admin123");
//     } else {
//       console.log("✅ Admin already exists");
//     }
//   } catch (err) {
//     console.error("❌ Error creating default admin:", err);
//   }
// };

// createDefaultAdmin();

// // -----------------------------------------------
// // Health Check
// // -----------------------------------------------
// app.get("/", (req, res) => {
//   res.send("🚀 Server is running successfully with Blog, Likes & Media Support!");
// });

// // Dashboard Summary API
// app.get("/api/dashboard/summary", async (req, res) => {
//   try {
//     const blogCountRes = await pool.query(
//       "SELECT COUNT(*) FROM posts WHERE is_draft = false"
//     );
//     const totalBlogs = parseInt(blogCountRes.rows[0].count);

//     const imageCountRes = await pool.query(
//       `SELECT COUNT(*) FROM posts WHERE media_path IS NOT NULL AND 
//       (media_path ILIKE '%.jpg' OR media_path ILIKE '%.jpeg' OR media_path ILIKE '%.png' OR media_path ILIKE '%.webp')`
//     );
//     const totalImages = parseInt(imageCountRes.rows[0].count);

//     const videoCountRes = await pool.query(
//       `SELECT COUNT(*) FROM posts WHERE media_path IS NOT NULL AND 
//       (media_path ILIKE '%.mp4' OR media_path ILIKE '%.webm')`
//     );
//     const totalVideos = parseInt(videoCountRes.rows[0].count);

//     res.json({
//       totalBlogs,
//       totalImages,
//       totalVideos,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching dashboard summary:", err);
//     res.status(500).json({ error: "Failed to fetch summary" });
//   }
// });

// // -----------------------------------------------
// // Start Server
// // -----------------------------------------------
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const pool = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");
const activityRoutes = require("./routes/activityRoutes");
const mediaRoutes = require("./routes/media");
const blogModeRoutes = require("./routes/blogModeRoutes");
const blogsRoute = require("./routes/blogs");
const landingContentRoutes = require("./routes/landingContentRoutes");

// ⭐ NEW THEME ROUTE
const themeRoutes = require("./routes/theme");

// =====================================================
// 📦 OOP SERVER CLASS
// =====================================================
class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;

    this.initializeMiddlewares();
    this.ensureFolders();
    this.initializeRoutes();
    this.createDefaultAdmin();
    this.healthCheckRoute();
    this.dashboardSummaryRoute();
  }

  // ---------------------------------------------------
  // ⭐ Middlewares
  // ---------------------------------------------------
  initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  // ---------------------------------------------------
  // ⭐ Ensure required folders exist
  // ---------------------------------------------------
  ensureFolders() {
    const mediaPath = path.join(__dirname, "media");
    const uploadsPath = path.join(__dirname, "uploads");

    if (!fs.existsSync(mediaPath)) {
      fs.mkdirSync(mediaPath, { recursive: true });
      console.log("📁 Media folder created automatically");
    }

    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log("📁 Uploads folder created automatically");
    }

    this.app.use("/media", express.static(mediaPath));
    this.app.use("/uploads", express.static(uploadsPath));
  }

  // ---------------------------------------------------
  // ⭐ Register all API routes
  // ---------------------------------------------------
  initializeRoutes() {
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/contact", contactRoutes);
    this.app.use("/api/admin", adminRoutes);
    this.app.use("/api/activities", activityRoutes);
    this.app.use("/api/media", mediaRoutes);
    this.app.use("/api", blogModeRoutes);
    this.app.use("/api/blogs", blogsRoute);
    this.app.use("/api/admin/landing-content", landingContentRoutes);

    // ⭐ NEW: THEME COLOR ROUTE
    this.app.use("/api/admin", themeRoutes);
  }

  // ---------------------------------------------------
  // ⭐ Create default admin (admin/admin123)
  // ---------------------------------------------------
  async createDefaultAdmin() {
    try {
      const result = await pool.query(
        "SELECT * FROM admins WHERE username=$1",
        ["admin"]
      );

      if (result.rows.length === 0) {
        const hashedPassword = await bcrypt.hash("admin123", 10);

        await pool.query(
          "INSERT INTO admins (username, password) VALUES ($1, $2)",
          ["admin", hashedPassword]
        );

        console.log("✅ Default admin created: username=admin | password=admin123");
      } else {
        console.log("✅ Admin already exists");
      }
    } catch (err) {
      console.error("❌ Error creating default admin:", err);
    }
  }

  // ---------------------------------------------------
  // ⭐ Health Check Route
  // ---------------------------------------------------
  healthCheckRoute() {
    this.app.get("/", (req, res) => {
      res.send("🚀 Server is running successfully with Blog, Likes & Media Support!");
    });
  }

  // ---------------------------------------------------
  // ⭐ Dashboard Summary Route
  // ---------------------------------------------------
  dashboardSummaryRoute() {
    this.app.get("/api/dashboard/summary", async (req, res) => {
      try {
        const blogCountRes = await pool.query(
          "SELECT COUNT(*) FROM posts WHERE is_draft = false"
        );
        const imageCountRes = await pool.query(
          `SELECT COUNT(*) FROM posts 
           WHERE media_path IS NOT NULL 
           AND (media_path ILIKE '%.jpg' OR media_path ILIKE '%.jpeg' 
           OR media_path ILIKE '%.png' OR media_path ILIKE '%.webp')`
        );
        const videoCountRes = await pool.query(
          `SELECT COUNT(*) FROM posts 
           WHERE media_path IS NOT NULL 
           AND (media_path ILIKE '%.mp4' OR media_path ILIKE '%.webm')`
        );

        res.json({
          totalBlogs: Number(blogCountRes.rows[0].count),
          totalImages: Number(imageCountRes.rows[0].count),
          totalVideos: Number(videoCountRes.rows[0].count),
        });
      } catch (err) {
        console.error("❌ Error fetching dashboard summary:", err);
        res.status(500).json({ error: "Failed to fetch summary" });
      }
    });
  }

  // ---------------------------------------------------
  // ⭐ Start server
  // ---------------------------------------------------
  start() {
    this.app.listen(this.port, () =>
      console.log(`✅ Server running on port ${this.port}`)
    );
  }
}

// =====================================================
// 🚀 Start the Server
// =====================================================
const server = new Server();
server.start();
