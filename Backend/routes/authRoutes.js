
// // module.exports = router;
// require("dotenv").config();
// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // ✅ Helper: generate JWT token
// const generateToken = (payload) =>
//   jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

// // -------------------- LOGIN ROUTE --------------------
// router.post("/admin/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const result = await pool.query(
//       "SELECT * FROM admins WHERE username=$1",
//       [username]
//     );
//     const admin = result.rows[0];
//     if (!admin) return res.status(400).json({ message: "Invalid username or password" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });

//     const token = generateToken({ id: admin.id, username: admin.username });

//     res.json({
//       message: "Login successful",
//       token,
//       admin: { id: admin.id, username: admin.username },
//     });
//   } catch (error) {
//     console.error("Admin login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // -------------------- ADD NEW ADMIN (MAIN ADMIN ONLY) --------------------
// router.post("/admin/add", async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });

//     const payload = jwt.verify(token, process.env.JWT_SECRET);

//     // Only main admin can add new admins
//     const adminResult = await pool.query("SELECT * FROM admins WHERE id=$1", [payload.id]);
//     if (adminResult.rows[0].username !== "admin") {
//       return res.status(403).json({ message: "Forbidden: Only main admin can add users" });
//     }

//     const { username, password } = req.body;

//     // Check if username already exists
//     const existing = await pool.query("SELECT * FROM admins WHERE username=$1", [username]);
//     if (existing.rows.length > 0) {
//       return res.status(400).json({ message: "Username already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await pool.query(
//       "INSERT INTO admins (username, password) VALUES ($1, $2)",
//       [username, hashedPassword]
//     );

//     res.json({ message: "Admin created successfully" });
//   } catch (err) {
//     console.error("Add admin error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;


require("dotenv").config();
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
//     Helper Function (JWT)
// ===============================
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

// ===============================
//   OOP CONTROLLER CLASS
// ===============================
class AdminController {
  constructor(pool) {
    this.pool = pool;
  }

  // -------------------- LOGIN --------------------
  login = async (req, res) => {
    try {
      const { username, password } = req.body;

      const result = await this.pool.query(
        "SELECT * FROM admins WHERE username=$1",
        [username]
      );

      const admin = result.rows[0];
      if (!admin)
        return res
          .status(400)
          .json({ message: "Invalid username or password" });

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ message: "Invalid username or password" });

      const token = generateToken({ id: admin.id, username: admin.username });

      res.json({
        message: "Login successful",
        token,
        admin: { id: admin.id, username: admin.username },
      });
    } catch (err) {
      console.error("❌ Admin login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // -------------------- ADD NEW ADMIN (MAIN ADMIN ONLY) --------------------
  addAdmin = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token)
        return res.status(401).json({ message: "Unauthorized" });

      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Check if logged-in admin is main admin
      const adminResult = await this.pool.query(
        "SELECT * FROM admins WHERE id=$1",
        [payload.id]
      );

      if (adminResult.rows[0].username !== "admin") {
        return res
          .status(403)
          .json({ message: "Forbidden: Only main admin can add users" });
      }

      const { username, password } = req.body;

      // Check if username already exists
      const existing = await this.pool.query(
        "SELECT * FROM admins WHERE username=$1",
        [username]
      );

      if (existing.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.pool.query(
        "INSERT INTO admins (username, password) VALUES ($1, $2)",
        [username, hashedPassword]
      );

      res.json({ message: "Admin created successfully" });
    } catch (err) {
      console.error("❌ Add admin error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
}

// ===============================
//   CONTROLLER INSTANCE
// ===============================
const adminController = new AdminController(pool);

// ===============================
//            ROUTES
// ===============================
router.post("/admin/login", adminController.login);
router.post("/admin/add", adminController.addAdmin);

module.exports = router;
