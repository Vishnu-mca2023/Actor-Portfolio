// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const pool = require("../config/db");
// const authenticateUser = require("../middleware/auth");

// const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// // Ensure media folder exists
// const mediaDir = path.join(__dirname, "..", "media");
// if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, mediaDir),
//   filename: (req, file, cb) =>
//     cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// // Log activity
// const logActivity = async (action_type, description) => {
//   try {
//     await pool.query(
//       "INSERT INTO activity_log (activity_type, description, created_at) VALUES ($1, $2, NOW())",
//       [action_type, description]
//     );
//   } catch (err) {
//     console.error("❌ Failed to log activity:", err);
//   }
// };

// // =======================================================
// //                    CREATE POST
// // =======================================================
// router.post("/", upload.single("mediaFile"), async (req, res) => {
//   try {
//     const {
//       title,
//       short_description,
//       content,
//       conclusion,
//       mediaPreview,
//       is_draft,
//       category,
//       customCategory
//     } = req.body;

//     // category logic
//     const finalCategory = category === "custom" ? customCategory : category;

//     let media_path = "";
//     if (req.file) media_path = `/media/${req.file.filename}`;
//     else if (mediaPreview) media_path = mediaPreview.replace(BASE_URL, "");

//     const result = await pool.query(
//       `INSERT INTO posts 
//         (title, short_description, content, conclusion, media_path, is_draft, category)
//        VALUES ($1,$2,$3,$4,$5,$6,$7) 
//        RETURNING *`,
//       [
//         title,
//         short_description,
//         content,
//         conclusion || null,
//         media_path,
//         is_draft === "true",
//         finalCategory
//       ]
//     );

//     const post = result.rows[0];
//     post.media_path = post.media_path ? `${BASE_URL}${post.media_path}` : null;

//     await logActivity("Created", `New post added: "${title}"`);

//     res.json(post);
//   } catch (err) {
//     console.error("❌ Error creating post:", err);
//     res.status(500).json({ error: "Failed to create post" });
//   }
// });

// // =======================================================
// //                GET ALL PUBLISHED POSTS
// // =======================================================
// router.get("/", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM posts WHERE is_draft = false ORDER BY id DESC"
//     );

//     const posts = result.rows.map((p) => ({
//       ...p,
//       media_path: p.media_path ? `${BASE_URL}${p.media_path}` : null,
//     }));

//     res.json(posts);
//   } catch (err) {
//     console.error("❌ Error fetching posts:", err);
//     res.status(500).json({ error: "Failed to fetch posts" });
//   }
// });

// // =======================================================
// //                    GET SINGLE POST
// // =======================================================
// router.get("/:id", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM posts WHERE id=$1", [
//       req.params.id,
//     ]);

//     if (!result.rows.length)
//       return res.status(404).json({ error: "Post not found" });

//     const post = result.rows[0];
//     post.media_path = post.media_path ? `${BASE_URL}${post.media_path}` : null;

//     res.json(post);
//   } catch (err) {
//     console.error("❌ Error fetching post:", err);
//     res.status(500).json({ error: "Failed to fetch post" });
//   }
// });

// // =======================================================
// //                 GET ALL DRAFT POSTS
// // =======================================================
// router.get("/drafts/admin", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM posts WHERE is_draft = true ORDER BY id DESC"
//     );

//     const drafts = result.rows.map((p) => ({
//       ...p,
//       media_path: p.media_path ? `${BASE_URL}${p.media_path}` : null,
//     }));

//     res.json(drafts);
//   } catch (err) {
//     console.error("❌ Error fetching drafts:", err);
//     res.status(500).json({ error: "Failed to fetch drafts" });
//   }
// });

// // =======================================================
// //                     UPDATE POST
// // =======================================================
// router.put("/:id", upload.single("mediaFile"), async (req, res) => {
//   try {
//     const {
//       title,
//       short_description,
//       content,
//       conclusion,
//       mediaPreview,
//       is_draft,
//       category,
//       customCategory
//     } = req.body;

//     const postId = req.params.id;

//     const finalCategory = category === "custom" ? customCategory : category;

//     let media_path = null;
//     if (req.file) media_path = `/media/${req.file.filename}`;
//     else if (mediaPreview) media_path = mediaPreview.replace(BASE_URL, "");

//     const result = await pool.query(
//       `UPDATE posts SET
//           title=$1,
//           short_description=$2,
//           content=$3,
//           conclusion=$4,
//           media_path=COALESCE($5, media_path),
//           is_draft=$6,
//           category=$7,
//           updated_at=NOW()
//          WHERE id=$8 
//          RETURNING *`,
//       [
//         title,
//         short_description,
//         content,
//         conclusion || null,
//         media_path,
//         is_draft === "true",
//         finalCategory,
//         postId
//       ]
//     );

//     if (!result.rows.length)
//       return res.status(404).json({ error: "Post not found" });

//     const post = result.rows[0];
//     post.media_path = post.media_path ? `${BASE_URL}${post.media_path}` : null;

//     await logActivity("Updated", `Post updated: "${title}"`);

//     res.json(post);
//   } catch (err) {
//     console.error("❌ Error updating post:", err);
//     res.status(500).json({ error: "Failed to update post" });
//   }
// });

// // =======================================================
// //                     DELETE POST
// // =======================================================
// router.delete("/:id", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "DELETE FROM posts WHERE id=$1 RETURNING title",
//       [req.params.id]
//     );

//     if (!result.rows.length)
//       return res.status(404).json({ error: "Post not found" });

//     await logActivity("Deleted", `Post deleted: "${result.rows[0].title}"`);

//     res.json({ message: "Post deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting post:", err);
//     res.status(500).json({ error: "Failed to delete post" });
//   }
// });

// // =======================================================
// //                     PUBLISH DRAFT
// // =======================================================
// router.put("/publish/:id", async (req, res) => {
//   try {
//     const postId = req.params.id;

//     const result = await pool.query(
//       "UPDATE posts SET is_draft=false, updated_at=NOW() WHERE id=$1 RETURNING *",
//       [postId]
//     );

//     if (!result.rows.length)
//       return res.status(404).json({ error: "Post not found" });

//     const post = result.rows[0];
//     post.media_path = post.media_path ? `${BASE_URL}${post.media_path}` : null;

//     await logActivity("Published", `Draft published: "${post.title}"`);

//     res.json({ message: "Draft published successfully", post });
//   } catch (err) {
//     console.error("❌ Error publishing draft:", err);
//     res.status(500).json({ error: "Failed to publish draft" });
//   }
// });

// // =======================================================
// //                      SEARCH POSTS
// // =======================================================
// router.get("/search", async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q)
//       return res.status(400).json({ error: "Query parameter 'q' is required" });

//     const result = await pool.query(
//       `SELECT * FROM posts 
//        WHERE is_draft = false 
//        AND (
//           LOWER(title) LIKE LOWER($1)
//           OR LOWER(category) LIKE LOWER($1)
//        )
//        ORDER BY id DESC`,
//       [`%${q}%`]
//     );

//     const posts = result.rows.map((p) => ({
//       ...p,
//       media_path: p.media_path ? `${BASE_URL}${p.media_path}` : null,
//     }));

//     res.json(posts);
//   } catch (err) {
//     console.error("❌ Error searching posts:", err);
//     res.status(500).json({ error: "Failed to search posts" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../config/db");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// ----------------------------------------------
//  Create media folder if not exists
// ----------------------------------------------
const mediaDir = path.join(__dirname, "..", "media");
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);

// ----------------------------------------------
//       Multer Configuration
// ----------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mediaDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ----------------------------------------------
//   Activity Log Utility
// ----------------------------------------------
const logActivity = async (type, description) => {
  try {
    await pool.query(
      "INSERT INTO activity_log (activity_type, description, created_at) VALUES ($1, $2, NOW())",
      [type, description]
    );
  } catch (err) {
    console.error("❌ Failed to log activity:", err);
  }
};

// =======================================================
//                    OOP CLASS
// =======================================================
class PostController {
  // CREATE POST
  async createPost(req, res) {
    try {
      const {
        title,
        short_description,
        content,
        conclusion,
        mediaPreview,
        is_draft,
        category,
        customCategory,
      } = req.body;

      const finalCategory = category === "custom" ? customCategory : category;

      let media_path = "";
      if (req.file) media_path = `/media/${req.file.filename}`;
      else if (mediaPreview) media_path = mediaPreview.replace(BASE_URL, "");

      const result = await pool.query(
        `INSERT INTO posts 
        (title, short_description, content, conclusion, media_path, is_draft, category)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [
          title,
          short_description,
          content,
          conclusion || null,
          media_path,
          is_draft === "true",
          finalCategory,
        ]
      );

      const post = result.rows[0];
      post.media_path = post.media_path ? `${BASE_URL}${post.media_path}` : null;

      await logActivity("Created", `New post added: "${title}"`);

      res.json(post);
    } catch (err) {
      console.error("❌ Error creating post:", err);
      res.status(500).json({ error: "Failed to create post" });
    }
  }

  // GET ALL PUBLISHED POSTS
  async getPublishedPosts(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM posts WHERE is_draft = false ORDER BY id DESC"
      );

      const posts = result.rows.map((p) => ({
        ...p,
        media_path: p.media_path ? `${BASE_URL}${p.media_path}` : null,
      }));

      res.json(posts);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  }

  // GET SINGLE POST
  async getSinglePost(req, res) {
    try {
      const result = await pool.query("SELECT * FROM posts WHERE id=$1", [
        req.params.id,
      ]);

      if (!result.rows.length)
        return res.status(404).json({ error: "Post not found" });

      const post = result.rows[0];
      post.media_path = post.media_path ? `${BASE_URL}${post.media_path}` : null;

      res.json(post);
    } catch (err) {
      console.error("❌ Error fetching post:", err);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  }

  // GET ALL DRAFT POST
  async getAllDrafts(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM posts WHERE is_draft = true ORDER BY id DESC"
      );

      const posts = result.rows.map((p) => ({
        ...p,
        media_path: p.media_path ? `${BASE_URL}${p.media_path}` : null,
      }));

      res.json(posts);
    } catch (err) {
      console.error("❌ Error fetching drafts:", err);
      res.status(500).json({ error: "Failed to fetch drafts" });
    }
  }

  // UPDATE POST
  async updatePost(req, res) {
    try {
      const {
        title,
        short_description,
        content,
        conclusion,
        mediaPreview,
        is_draft,
        category,
        customCategory,
      } = req.body;

      const postId = req.params.id;

      const finalCategory = category === "custom" ? customCategory : category;

      let media_path = null;
      if (req.file) media_path = `/media/${req.file.filename}`;
      else if (mediaPreview) media_path = mediaPreview.replace(BASE_URL, "");

      const result = await pool.query(
        `UPDATE posts SET
          title=$1,
          short_description=$2,
          content=$3,
          conclusion=$4,
          media_path=COALESCE($5, media_path),
          is_draft=$6,
          category=$7,
          updated_at=NOW()
         WHERE id=$8 RETURNING *`,
        [
          title,
          short_description,
          content,
          conclusion || null,
          media_path,
          is_draft === "true",
          finalCategory,
          postId,
        ]
      );

      if (!result.rows.length)
        return res.status(404).json({ error: "Post not found" });

      const post = result.rows[0];
      post.media_path = post.media_path ? `${BASE_URL}${post.media_path}` : null;

      await logActivity("Updated", `Post updated: "${title}"`);

      res.json(post);
    } catch (err) {
      console.error("❌ Error updating post:", err);
      res.status(500).json({ error: "Failed to update post" });
    }
  }

  // DELETE POST
  async deletePost(req, res) {
    try {
      const result = await pool.query(
        "DELETE FROM posts WHERE id=$1 RETURNING title",
        [req.params.id]
      );

      if (!result.rows.length)
        return res.status(404).json({ error: "Post not found" });

      await logActivity("Deleted", `Post deleted: "${result.rows[0].title}"`);

      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting post:", err);
      res.status(500).json({ error: "Failed to delete post" });
    }
  }

  // PUBLISH DRAFT
  async publishDraft(req, res) {
    try {
      const result = await pool.query(
        "UPDATE posts SET is_draft=false, updated_at=NOW() WHERE id=$1 RETURNING *",
        [req.params.id]
      );

      if (!result.rows.length)
        return res.status(404).json({ error: "Post not found" });

      const post = result.rows[0];
      post.media_path = post.media_path ? `${BASE_URL}${post.media_path}` : null;

      await logActivity("Published", `Draft published: "${post.title}"`);

      res.json({ message: "Draft published successfully", post });
    } catch (err) {
      console.error("❌ Error publishing draft:", err);
      res.status(500).json({ error: "Failed to publish draft" });
    }
  }

  // SEARCH POSTS
  async searchPosts(req, res) {
    try {
      const { q } = req.query;

      if (!q)
        return res.status(400).json({ error: "Query parameter 'q' is required" });

      const result = await pool.query(
        `SELECT * FROM posts 
         WHERE is_draft = false AND (
            LOWER(title) LIKE LOWER($1) OR 
            LOWER(category) LIKE LOWER($1)
         )
         ORDER BY id DESC`,
        [`%${q}%`]
      );

      const posts = result.rows.map((p) => ({
        ...p,
        media_path: p.media_path ? `${BASE_URL}${p.media_path}` : null,
      }));

      res.json(posts);
    } catch (err) {
      console.error("❌ Error searching posts:", err);
      res.status(500).json({ error: "Failed to search posts" });
    }
  }
}

// =======================================================
//               INSTANCE OF CLASS
// =======================================================
const postController = new PostController();

// =======================================================
//                   ROUTES
// =======================================================

// Create post
router.post("/", upload.single("mediaFile"), (req, res) =>
  postController.createPost(req, res)
);

// Get all published posts
router.get("/", (req, res) =>
  postController.getPublishedPosts(req, res)
);

// Get single post
router.get("/:id", (req, res) =>
  postController.getSinglePost(req, res)
);

// Get all drafts
router.get("/drafts/admin", (req, res) =>
  postController.getAllDrafts(req, res)
);

// Update post
router.put("/:id", upload.single("mediaFile"), (req, res) =>
  postController.updatePost(req, res)
);

// Delete post
router.delete("/:id", (req, res) =>
  postController.deletePost(req, res)
);

// Publish draft
router.put("/publish/:id", (req, res) =>
  postController.publishDraft(req, res)
);

// Search posts
router.get("/search", (req, res) =>
  postController.searchPosts(req, res)
);

module.exports = router;
