// const express = require("express");
// const multer = require("multer");
// const pool = require("../config/db");
// const router = express.Router();

// const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

// // ✅ Upload video (does NOT delete old ones)
// router.post("/upload-video", upload.single("video"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "No video uploaded" });

//     const { originalname, mimetype, buffer } = req.file;
//     await pool.query(
//       "INSERT INTO landing_videos (filename, mimetype, data) VALUES ($1, $2, $3)",
//       [originalname, mimetype, buffer]
//     );

//     res.json({ message: "✅ New landing video uploaded!" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error while uploading video" });
//   }
// });

// // ✅ Fetch latest video (for Home page + Admin preview)
// router.get("/landing-video", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, filename, mimetype, data FROM landing_videos ORDER BY uploaded_at DESC LIMIT 1"
//     );
//     if (!result.rows.length) return res.status(404).send("No video found");

//     const video = result.rows[0];
//     res.set("Content-Type", video.mimetype);
//     res.send(video.data);
//   } catch (error) {
//     res.status(500).send("Server error while streaming video");
//   }
// });

// // GET specific video by id (stream)
// router.get("/landing-video/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const result = await pool.query("SELECT * FROM landing_videos WHERE id = $1", [id]);
//     if (!result.rows.length) return res.status(404).send("Video not found");

//     const row = result.rows[0];
//     const fileBuffer = row.data;
//     const mimeType = row.mimetype || "video/mp4";
//     const total = fileBuffer.length;
//     const range = req.headers.range;

//     if (range) {
//       const parts = range.replace(/bytes=/, "").split("-");
//       const start = parseInt(parts[0], 10);
//       const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
//       if (start >= total || end >= total) {
//         res.status(416).set({ "Content-Range": `bytes */${total}` }).end();
//         return;
//       }
//       const chunk = fileBuffer.slice(start, end + 1);
//       res.status(206).set({
//         "Content-Range": `bytes ${start}-${end}/${total}`,
//         "Accept-Ranges": "bytes",
//         "Content-Length": chunk.length,
//         "Content-Type": mimeType,
//       });
//       return res.end(chunk);
//     } else {
//       res.status(200).set({
//         "Content-Length": total,
//         "Content-Type": mimeType,
//         "Accept-Ranges": "bytes",
//       });
//       return res.end(fileBuffer);
//     }
//   } catch (err) {
//     console.error("❌ Fetch video by id error:", err);
//     return res.status(500).send("Server error fetching video by id");
//   }
// });

// // DELETE old video
// router.delete("/delete-video/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query("DELETE FROM landing_videos WHERE id = $1", [id]);
//     res.json({ message: "Video deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to delete video" });
//   }
// });


// // ✅ Fetch all old uploaded videos
// router.get("/all-videos", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT id, filename FROM landing_videos ORDER BY uploaded_at DESC");
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: "Can't fetch old videos" });
//   }
// });

// // ✅ Reuse old video as current landing video
// router.post("/use-old-video", async (req, res) => {
//   try {
//     const { id } = req.body;
//     const result = await pool.query("SELECT * FROM landing_videos WHERE id = $1", [id]);
//     if (!result.rows.length) return res.status(404).json({ message: "Video not found" });

//     const { filename, mimetype, data } = result.rows[0];
//     await pool.query(
//       "INSERT INTO landing_videos (filename, mimetype, data) VALUES ($1, $2, $3)",
//       [filename, mimetype, data]
//     );

//     res.json({ message: "✅ Old video applied as landing video!" });
//   } catch (error) {
//     res.status(500).json({ message: "Error using old video" });
//   }
// });


// // ✅ ---------- LOGO MANAGEMENT ----------
// const logoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// // Upload new logo
// router.post("/upload-logo", logoUpload.single("logo"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "No logo uploaded" });

//     const { originalname, mimetype, buffer } = req.file;
//     await pool.query(
//       "INSERT INTO landing_logos (filename, mimetype, data) VALUES ($1, $2, $3)",
//       [originalname, mimetype, buffer]
//     );

//     res.json({ message: "✅ Logo uploaded successfully!" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error while uploading logo" });
//   }
// });

// // Fetch latest logo
// router.get("/landing-logo", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, filename, mimetype, data FROM landing_logos ORDER BY uploaded_at DESC LIMIT 1"
//     );
//     if (!result.rows.length) return res.status(404).send("No logo found");

//     const logo = result.rows[0];
//     res.set("Content-Type", logo.mimetype);
//     res.send(logo.data);
//   } catch (err) {
//     res.status(500).send("Server error while fetching logo");
//   }
// });

// // Fetch all logos
// router.get("/all-logos", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT id, filename FROM landing_logos ORDER BY uploaded_at DESC");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Can't fetch logos" });
//   }
// });

// // Fetch specific logo by id
// router.get("/landing-logo/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query("SELECT * FROM landing_logos WHERE id = $1", [id]);
//     if (!result.rows.length) return res.status(404).send("Logo not found");

//     const logo = result.rows[0];
//     res.set("Content-Type", logo.mimetype);
//     res.send(logo.data);
//   } catch (err) {
//     res.status(500).send("Server error fetching logo by ID");
//   }
// });

// // Use old logo
// router.post("/use-old-logo", async (req, res) => {
//   try {
//     const { id } = req.body;
//     const result = await pool.query("SELECT * FROM landing_logos WHERE id = $1", [id]);
//     if (!result.rows.length) return res.status(404).json({ message: "Logo not found" });

//     const { filename, mimetype, data } = result.rows[0];
//     await pool.query(
//       "INSERT INTO landing_logos (filename, mimetype, data) VALUES ($1, $2, $3)",
//       [filename, mimetype, data]
//     );

//     res.json({ message: "✅ Old logo applied as current logo!" });
//   } catch (err) {
//     res.status(500).json({ message: "Error using old logo" });
//   }
// });

// // Delete logo
// router.delete("/delete-logo/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query("DELETE FROM landing_logos WHERE id = $1", [id]);
//     res.json({ message: "Logo deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete logo" });
//   }
// });

// // backend/routes/admin.js
// router.get("/stats", async (req, res) => {
//   try {
//     // Count all posts
//     const postCount = await pool.query("SELECT COUNT(*) FROM posts");

//     // Count images (where image column is not null or empty)
//     const imageCount = await pool.query(
//       "SELECT COUNT(*) FROM posts WHERE image IS NOT NULL AND image <> ''"
//     );

//     // Count videos (where video column is not null or empty)
//     const videoCount = await pool.query(
//       "SELECT COUNT(*) FROM posts WHERE video IS NOT NULL AND video <> ''"
//     );

//     // Count contact info (if you have table contact_info)
//     const contactCount = await pool.query("SELECT COUNT(*) FROM contact_info");

//     res.json({
//       posts: Number(postCount.rows[0].count),
//       images: Number(imageCount.rows[0].count),
//       videos: Number(videoCount.rows[0].count),
//       contacts: Number(contactCount.rows[0]?.count || 0),
//     });
//   } catch (err) {
//     console.error("❌ Error fetching stats:", err);
//     res.status(500).json({ message: "Failed to fetch stats" });
//   }
// });


// router.get("/counts", async (req, res) => {
//   try {
//     const [postCount, imageCount, videoCount, contactCount] = await Promise.all([
//       pool.query("SELECT COUNT(*) FROM posts"),
//       pool.query("SELECT COUNT(*) FROM posts WHERE image IS NOT NULL AND image != ''"),
//       pool.query("SELECT COUNT(*) FROM posts WHERE video IS NOT NULL AND video != ''"),
//       pool.query("SELECT COUNT(*) FROM contacts"),
//     ]);

//     res.json({
//       posts: parseInt(postCount.rows[0].count),
//       images: parseInt(imageCount.rows[0].count),
//       videos: parseInt(videoCount.rows[0].count),
//       contacts: parseInt(contactCount.rows[0].count),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching counts" });
//   }
// });

// // ===== BLOG VIEW MODE ROUTES =====
// router.get("/blog-view-mode", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT value FROM admin_settings WHERE key=$1",
//       ["blogViewMode"]
//     );
//     const mode = result.rows.length ? result.rows[0].value : "static";
//     res.json({ mode });
//   } catch (err) {
//     console.error("❌ Error fetching blog view mode:", err);
//     res.status(500).json({ error: "Failed to fetch blog view mode" });
//   }
// });


// router.post("/update-blog-view-mode", async (req, res) => {
//   try {
//     const { mode } = req.body; // mode = 'swipe' or 'static'
//     if (!["swipe", "static"].includes(mode)) return res.status(400).json({ error: "Invalid mode" });

//     // Upsert into admin_settings
//     await pool.query(
//       `INSERT INTO admin_settings (key, value)
//        VALUES ($1, $2)
//        ON CONFLICT (key) DO UPDATE SET value=$2`,
//       ["blogViewMode", mode]
//     );

//     res.json({ mode });
//   } catch (err) {
//     console.error("❌ Error updating blog view mode:", err);
//     res.status(500).json({ error: "Failed to update blog view mode" });
//   }
// });

// // ========================
// // CLEAN + UPDATED ABOUT US
// // ========================

// // Multer for About Us image upload
// const aboutUpload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
// });





// router.post('/add-user', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Unauthorized' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const result = await pool.query('SELECT * FROM admins WHERE id=$1', [decoded.id]);
//     const currentAdmin = result.rows[0];

//     if (!currentAdmin || currentAdmin.username !== 'admin') {
//       return res.status(403).json({ message: 'Only main admin can add users.' });
//     }

//     const { username, password } = req.body;
//     if (!username || !password) return res.status(400).json({ message: 'Username and password required.' });

//     const existing = await pool.query('SELECT * FROM admins WHERE username=$1', [username]);
//     if (existing.rows.length > 0) return res.status(400).json({ message: 'Username already exists.' });

//     const hashed = await bcrypt.hash(password, 10);
//     await pool.query('INSERT INTO admins (username, password) VALUES ($1,$2)', [username, hashed]);
//     res.json({ message: 'New admin added successfully.' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Multer setup

// // ⭐ GET About Us
// router.get("/about-us", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM about_us WHERE id = 1");

//     if (result.rows.length === 0) {
//       return res.json({
//         content: "",
//         image: null,
//         filename: "",
//         updated_at: null,
//       });
//     }

//     const row = result.rows[0];

//     // Always return API URL for image
//     const imageUrl = row.image ? `/api/admin/about-us/image/1` : null;

//     res.json({
//       content: row.content || "",
//       image: imageUrl,
//       filename: row.filename || "",
//       updated_at: row.updated_at || null,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching About Us:", err);
//     res.status(500).json({ error: "Failed to fetch About Us" });
//   }
// });

// // ⭐ SERVE IMAGE
// router.get("/about-us/image/:id", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT mimetype, image FROM about_us WHERE id = $1",
//       [req.params.id]
//     );

//     if (!result.rows.length || !result.rows[0].image) {
//       return res.status(404).send("Image not found");
//     }

//     res.set("Content-Type", result.rows[0].mimetype);
//     res.send(result.rows[0].image);
//   } catch (err) {
//     console.error("❌ Image fetch error:", err);
//     res.status(500).send("Server error");
//   }
// });

// //  UPDATE About Us (text + optional image)
// router.post(
//   "/about-us",
//   aboutUpload.single("image"),
//   async (req, res) => {
//     try {
//       const { content } = req.body;

//       if (req.file) {
//         // Update text + image
//         await pool.query(
//           `
//             INSERT INTO about_us (id, content, filename, mimetype, image, updated_at)
//             VALUES (1, $1, $2, $3, $4, NOW())
//             ON CONFLICT (id) DO UPDATE
//             SET content=$1, filename=$2, mimetype=$3, image=$4, updated_at=NOW()
//           `,
//           [
//             content,
//             req.file.originalname,
//             req.file.mimetype,
//             req.file.buffer,
//           ]
//         );
//       } else {
//         // Update only text
//         await pool.query(
//           `
//             INSERT INTO about_us (id, content, updated_at)
//             VALUES (1, $1, NOW())
//             ON CONFLICT (id) DO UPDATE
//             SET content=$1, updated_at=NOW()
//           `,
//           [content]
//         );
//       }

//       res.json({
//         message: "About Us updated successfully",
//         image: req.file ? `/api/admin/about-us/image/1` : null,
//       });
//     } catch (err) {
//       console.error("❌ Failed to update About Us:", err);
//       res.status(500).json({ error: "Failed to update About Us" });
//     }
//   }
// );

// module.exports = router;







require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const memoryStorage = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });
const logoStorage = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const aboutUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// =========================================================
//                 OOP CONTROLLER
// =========================================================

class AdminController {
  constructor(pool) {
    this.pool = pool;
  }

  // ---------------- VIDEO UPLOAD ----------------
  uploadVideo = async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No video uploaded" });

      const { originalname, mimetype, buffer } = req.file;

      await this.pool.query(
        "INSERT INTO landing_videos (filename, mimetype, data) VALUES ($1, $2, $3)",
        [originalname, mimetype, buffer]
      );

      res.json({ message: "Video uploaded successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while uploading video" });
    }
  };

  // ---------------- FETCH LATEST VIDEO ----------------
  getLatestVideo = async (req, res) => {
    try {
      const result = await this.pool.query(
        "SELECT * FROM landing_videos ORDER BY uploaded_at DESC LIMIT 1"
      );

      if (!result.rows.length) return res.status(404).send("No video found");

      const video = result.rows[0];
      res.set("Content-Type", video.mimetype);
      res.send(video.data);
    } catch (err) {
      res.status(500).send("Server error while streaming video");
    }
  };

  // ---------------- FETCH SPECIFIC VIDEO ----------------
  getVideoById = async (req, res) => {
    try {
      const id = req.params.id;
      const result = await this.pool.query("SELECT * FROM landing_videos WHERE id=$1", [id]);

      if (!result.rows.length) return res.status(404).send("Video not found");

      const row = result.rows[0];
      const buffer = row.data;
      const total = buffer.length;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

        const chunk = buffer.slice(start, end + 1);
        res.status(206).set({
          "Content-Range": `bytes ${start}-${end}/${total}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunk.length,
          "Content-Type": row.mimetype,
        });

        return res.end(chunk);
      }

      res.set({
        "Content-Length": total,
        "Content-Type": row.mimetype,
        "Accept-Ranges": "bytes",
      });

      res.end(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching video by ID");
    }
  };

  deleteVideo = async (req, res) => {
    try {
      await this.pool.query("DELETE FROM landing_videos WHERE id=$1", [req.params.id]);
      res.json({ message: "Video deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete video" });
    }
  };

  // ---------------- FETCH ALL VIDEOS ----------------
  getAllVideos = async (req, res) => {
    try {
      const result = await this.pool.query(
        "SELECT id, filename FROM landing_videos ORDER BY uploaded_at DESC"
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: "Error fetching videos" });
    }
  };

  reuseOldVideo = async (req, res) => {
    try {
      const { id } = req.body;
      const result = await this.pool.query("SELECT * FROM landing_videos WHERE id=$1", [id]);

      if (!result.rows.length) return res.status(404).json({ message: "Video not found" });

      const { filename, mimetype, data } = result.rows[0];

      await this.pool.query(
        "INSERT INTO landing_videos (filename, mimetype, data) VALUES ($1, $2, $3)",
        [filename, mimetype, data]
      );

      res.json({ message: "Old video applied successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Error applying old video" });
    }
  };

  // =====================================================
  //                        LOGOS
  // =====================================================

  uploadLogo = async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No logo uploaded" });

      const { originalname, mimetype, buffer } = req.file;

      await this.pool.query(
        "INSERT INTO landing_logos (filename, mimetype, data) VALUES ($1, $2, $3)",
        [originalname, mimetype, buffer]
      );

      res.json({ message: "Logo uploaded successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Server error while uploading logo" });
    }
  };

  getLatestLogo = async (req, res) => {
    try {
      const result = await this.pool.query(
        "SELECT * FROM landing_logos ORDER BY uploaded_at DESC LIMIT 1"
      );

      if (!result.rows.length) return res.status(404).send("No logo found");

      const logo = result.rows[0];
      res.set("Content-Type", logo.mimetype);
      res.send(logo.data);
    } catch (err) {
      res.status(500).send("Server error fetching logo");
    }
  };

  getAllLogos = async (req, res) => {
    try {
      const result = await this.pool.query(
        "SELECT id, filename FROM landing_logos ORDER BY uploaded_at DESC"
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: "Cannot fetch logos" });
    }
  };

  getLogoById = async (req, res) => {
    try {
      const result = await this.pool.query("SELECT * FROM landing_logos WHERE id=$1", [
        req.params.id,
      ]);

      if (!result.rows.length) return res.status(404).send("Logo not found");

      const logo = result.rows[0];
      res.set("Content-Type", logo.mimetype);
      res.send(logo.data);
    } catch (err) {
      res.status(500).send("Error fetching logo by ID");
    }
  };

  reuseOldLogo = async (req, res) => {
    try {
      const { id } = req.body;
      const result = await this.pool.query("SELECT * FROM landing_logos WHERE id=$1", [id]);

      if (!result.rows.length) return res.status(404).json({ message: "Logo not found" });

      const { filename, mimetype, data } = result.rows[0];

      await this.pool.query(
        "INSERT INTO landing_logos (filename, mimetype, data) VALUES ($1, $2, $3)",
        [filename, mimetype, data]
      );

      res.json({ message: "Old logo applied successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Failed to use old logo" });
    }
  };

  deleteLogo = async (req, res) => {
    try {
      await this.pool.query("DELETE FROM landing_logos WHERE id=$1", [req.params.id]);
      res.json({ message: "Logo deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete logo" });
    }
  };

  // =====================================================
  //                      STATS
  // =====================================================

  getStats = async (req, res) => {
    try {
      const [postCount, imageCount, videoCount, contactCount] = await Promise.all([
        this.pool.query("SELECT COUNT(*) FROM posts"),
        this.pool.query("SELECT COUNT(*) FROM posts WHERE image IS NOT NULL AND image <> ''"),
        this.pool.query("SELECT COUNT(*) FROM posts WHERE video IS NOT NULL AND video <> ''"),
        this.pool.query("SELECT COUNT(*) FROM contacts"),
      ]);

      res.json({
        posts: Number(postCount.rows[0].count),
        images: Number(imageCount.rows[0].count),
        videos: Number(videoCount.rows[0].count),
        contacts: Number(contactCount.rows[0].count),
      });
    } catch (err) {
      res.status(500).json({ message: "Error fetching counts" });
    }
  };

  // =====================================================
  //              BLOG VIEW MODE
  // =====================================================

  getBlogViewMode = async (req, res) => {
    try {
      const result = await this.pool.query(
        "SELECT value FROM admin_settings WHERE key=$1",
        ["blogViewMode"]
      );

      const mode = result.rows.length ? result.rows[0].value : "static";

      res.json({ mode });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch blog view mode" });
    }
  };

  updateBlogViewMode = async (req, res) => {
    try {
      const { mode } = req.body;

      if (!["swipe", "static"].includes(mode))
        return res.status(400).json({ error: "Invalid mode" });

      await this.pool.query(
        `
          INSERT INTO admin_settings (key, value)
          VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE SET value=$2
        `,
        ["blogViewMode", mode]
      );

      res.json({ mode });
    } catch (err) {
      res.status(500).json({ error: "Failed to update blog view mode" });
    }
  };

  // =====================================================
  //                      ADD ADMIN
  // =====================================================

  addAdmin = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const result = await this.pool.query("SELECT * FROM admins WHERE id=$1", [decoded.id]);

      if (result.rows[0].username !== "admin")
        return res.status(403).json({ message: "Only main admin can add users." });

      const { username, password } = req.body;

      const existing = await this.pool.query("SELECT * FROM admins WHERE username=$1", [username]);

      if (existing.rows.length > 0)
        return res.status(400).json({ message: "Username already exists." });

      const hashed = await bcrypt.hash(password, 10);

      await this.pool.query("INSERT INTO admins (username, password) VALUES ($1,$2)", [
        username,
        hashed,
      ]);

      res.json({ message: "Admin added successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };

  // =====================================================
  //                   ABOUT US
  // =====================================================

  getAboutUs = async (req, res) => {
    try {
      const result = await this.pool.query("SELECT * FROM about_us WHERE id=1");

      if (!result.rows.length) {
        return res.json({
          content: "",
          image: null,
          filename: "",
          updated_at: null,
        });
      }

      const row = result.rows[0];

      res.json({
        content: row.content,
        image: row.image ? `/api/admin/about-us/image/1` : null,
        filename: row.filename,
        updated_at: row.updated_at,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch About Us" });
    }
  };

  getAboutImage = async (req, res) => {
    try {
      const result = await this.pool.query(
        "SELECT mimetype, image FROM about_us WHERE id=$1",
        [req.params.id]
      );

      if (!result.rows.length || !result.rows[0].image)
        return res.status(404).send("Image not found");

      res.set("Content-Type", result.rows[0].mimetype);
      res.send(result.rows[0].image);
    } catch (err) {
      res.status(500).send("Server error");
    }
  };

  updateAboutUs = async (req, res) => {
    try {
      const { content } = req.body;

      if (req.file) {
        await this.pool.query(
          `
            INSERT INTO about_us (id, content, filename, mimetype, image, updated_at)
            VALUES (1, $1, $2, $3, $4, NOW())
            ON CONFLICT (id) DO UPDATE 
            SET content=$1, filename=$2, mimetype=$3, image=$4, updated_at=NOW()
          `,
          [content, req.file.originalname, req.file.mimetype, req.file.buffer]
        );
      } else {
        await this.pool.query(
          `
            INSERT INTO about_us (id, content, updated_at)
            VALUES (1, $1, NOW())
            ON CONFLICT (id) DO UPDATE
            SET content=$1, updated_at=NOW()
          `,
          [content]
        );
      }

      res.json({ message: "About Us updated!" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update About Us" });
    }
  };
}

// =====================================================
//                CREATE INSTANCE
// =====================================================
const controller = new AdminController(pool);

// =====================================================
//                 ROUTES BINDING
// =====================================================

// Videos
router.post("/upload-video", memoryStorage.single("video"), controller.uploadVideo);
router.get("/landing-video", controller.getLatestVideo);
router.get("/landing-video/:id", controller.getVideoById);
router.delete("/delete-video/:id", controller.deleteVideo);
router.get("/all-videos", controller.getAllVideos);
router.post("/use-old-video", controller.reuseOldVideo);

// Logo
router.post("/upload-logo", logoStorage.single("logo"), controller.uploadLogo);
router.get("/landing-logo", controller.getLatestLogo);
router.get("/all-logos", controller.getAllLogos);
router.get("/landing-logo/:id", controller.getLogoById);
router.post("/use-old-logo", controller.reuseOldLogo);
router.delete("/delete-logo/:id", controller.deleteLogo);

// Stats
router.get("/stats", controller.getStats);
router.get("/counts", controller.getStats);

// Blog View Mode
router.get("/blog-view-mode", controller.getBlogViewMode);
router.post("/update-blog-view-mode", controller.updateBlogViewMode);

// Add Admin
router.post("/add-user", controller.addAdmin);

// About Us
router.get("/about-us", controller.getAboutUs);
router.get("/about-us/image/:id", controller.getAboutImage);
router.post("/about-us", aboutUpload.single("image"), controller.updateAboutUs);

module.exports = router;
