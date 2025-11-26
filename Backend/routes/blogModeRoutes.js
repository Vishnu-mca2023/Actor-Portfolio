// // blogModeRoutes.js
// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db");

// // ===== GET CURRENT BLOG VIEW MODE =====
// router.get("/blog-view-mode", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT mode FROM blog_view_mode LIMIT 1");
//     if (result.rows.length === 0) {
//       // default mode
//       return res.json({ mode: "static" });
//     }
//     res.json({ mode: result.rows[0].mode });
//   } catch (err) {
//     console.error("Error fetching blog view mode:", err);
//     res.status(500).json({ error: "Failed to fetch blog view mode" });
//   }
// });

// // ===== SET BLOG VIEW MODE =====
// router.post("/set-blog-view-mode", async (req, res) => {
//   try {
//     const { mode } = req.body;
//     if (!["static", "swipe"].includes(mode))
//       return res.status(400).json({ error: "Invalid mode" });

//     // Upsert mode
//     await pool.query(
//       `INSERT INTO blog_view_mode (id, mode) VALUES (1, $1)
//        ON CONFLICT (id) DO UPDATE SET mode = $1`,
//       [mode]
//     );

//     res.json({ message: `Blog view mode updated to ${mode}`, mode });
//   } catch (err) {
//     console.error("Error updating blog view mode:", err);
//     res.status(500).json({ error: "Failed to update blog view mode" });
//   }
// });

// module.exports = router;


// blogModeRoutes.js (Merged OOP Code)

const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// =======================
//   OOP CONTROLLER CLASS
// =======================
class BlogModeController {
  constructor(pool) {
    this.pool = pool;
  }

  // ===== GET CURRENT BLOG VIEW MODE =====
  getBlogMode = async (req, res) => {
    try {
      const result = await this.pool.query(
        "SELECT mode FROM blog_view_mode LIMIT 1"
      );

      if (!result.rows.length) {
        return res.json({ mode: "static" }); // default mode
      }

      res.json({ mode: result.rows[0].mode });
    } catch (err) {
      console.error("❌ Error fetching blog view mode:", err);
      res.status(500).json({ error: "Failed to fetch blog view mode" });
    }
  };

  // ===== SET BLOG VIEW MODE =====
  setBlogMode = async (req, res) => {
    try {
      const { mode } = req.body;

      if (!["static", "swipe"].includes(mode)) {
        return res.status(400).json({ error: "Invalid mode" });
      }

      await this.pool.query(
        `INSERT INTO blog_view_mode (id, mode) VALUES (1, $1)
         ON CONFLICT (id) DO UPDATE SET mode = $1`,
        [mode]
      );

      res.json({
        message: `Blog view mode updated to ${mode}`,
        mode,
      });
    } catch (err) {
      console.error("❌ Error updating blog view mode:", err);
      res.status(500).json({ error: "Failed to update blog view mode" });
    }
  };
}

// Create Controller Instance
const blogModeController = new BlogModeController(pool);

// =======================
//        ROUTES
// =======================
router.get("/blog-view-mode", blogModeController.getBlogMode);
router.post("/set-blog-view-mode", blogModeController.setBlogMode);

module.exports = router;
