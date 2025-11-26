

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // 📂 Ensure /media directory exists
// const mediaDir = path.join(__dirname, "..", "media");
// if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);

// // 🟣 Multer Storage Setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, mediaDir),
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueName + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// /* =========================================================
//    🟢 1. Upload Media (Image or Video)
//    ========================================================= */
// router.post("/upload", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   const fileUrl = `/media/${req.file.filename}`;
//   const isVideo = req.file.mimetype.startsWith("video");
//   res.json({
//     message: "File uploaded successfully",
//     url: fileUrl,
//     type: isVideo ? "video" : "image",
//   });
// });

// /* =========================================================
//    🟢 2. Get All Media Files
//    ========================================================= */
// router.get("/", (req, res) => {
//   try {
//     const files = fs.readdirSync(mediaDir);
//     const mediaFiles = files.map((file) => {
//       const ext = path.extname(file).toLowerCase();
//       const isVideo = [".mp4", ".mov", ".avi", ".webm", ".ogg"].includes(ext);
//       return {
//         url: `/media/${file}`,
//         type: isVideo ? "video" : "image",
//       };
//     });
//     res.json(mediaFiles);
//   } catch (err) {
//     console.error("Error reading media directory:", err);
//     res.status(500).json({ error: "Failed to read media directory" });
//   }
// });

// /* =========================================================
//    🟢 3. Delete Media File
//    ========================================================= */
// router.delete("/:filename", (req, res) => {
//   const filePath = path.join(mediaDir, req.params.filename);
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//       res.json({ message: "File deleted successfully" });
//     } else {
//       res.status(404).json({ error: "File not found" });
//     }
//   } catch (err) {
//     console.error("Error deleting file:", err);
//     res.status(500).json({ error: "Failed to delete file" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📂 Ensure /media directory exists
const mediaDir = path.join(__dirname, "..", "media");
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);

// 🟣 Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mediaDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// =====================================================
//      ⭐ OOP CLASS HANDLING ALL MEDIA OPERATIONS
// =====================================================
class MediaController {
  // 1️⃣ Upload image / video
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/media/${req.file.filename}`;
      const isVideo = req.file.mimetype.startsWith("video");

      res.json({
        message: "File uploaded successfully",
        url: fileUrl,
        type: isVideo ? "video" : "image",
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to upload file" });
    }
  }

  // 2️⃣ Get all media files
  async getAllMedia(req, res) {
    try {
      const files = fs.readdirSync(mediaDir);

      const mediaFiles = files.map((file) => {
        const ext = path.extname(file).toLowerCase();
        const isVideo = [".mp4", ".mov", ".avi", ".webm", ".ogg"].includes(ext);

        return {
          url: `/media/${file}`,
          type: isVideo ? "video" : "image",
        };
      });

      res.json(mediaFiles);
    } catch (err) {
      console.error("Read directory error:", err);
      res.status(500).json({ error: "Failed to read media directory" });
    }
  }

  // 3️⃣ Delete a media file
  async deleteMedia(req, res) {
    try {
      const filePath = path.join(mediaDir, req.params.filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      fs.unlinkSync(filePath);
      res.json({ message: "File deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ error: "Failed to delete file" });
    }
  }
}

// Create instance of the controller
const mediaController = new MediaController();

// =====================================================
//                 ⭐ ROUTES USING OOP
// =====================================================

// Upload media
router.post("/upload", upload.single("file"), (req, res) =>
  mediaController.uploadFile(req, res)
);

// Get all media
router.get("/", (req, res) => mediaController.getAllMedia(req, res));

// Delete media
router.delete("/:filename", (req, res) =>
  mediaController.deleteMedia(req, res)
);

module.exports = router;
