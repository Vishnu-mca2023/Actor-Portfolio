// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db");

// // ✅ Function to log activity
// const logActivity = async (activity_type, description) => {
//   try {
//     await pool.query(
//       `INSERT INTO activity_log (activity_type, description, created_at)
//        VALUES ($1, $2, NOW())`,
//       [activity_type, description]
//     );
//   } catch (error) {
//     console.error("❌ Error logging activity:", error.message);
//   }
// };

// // ✅ Route to get all activity logs
// router.get("/", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM activity_log ORDER BY created_at DESC"
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error("❌ Error fetching activities:", error.message);
//     res.status(500).json({ error: "Failed to fetch activities" });
//   }
// });

// // ✅ Route to manually add an activity (for testing)
// router.post("/", async (req, res) => {
//   const { activity_type, description } = req.body;
//   try {
//     await logActivity(activity_type, description);
//     res.json({ success: true, message: "Activity added successfully" });
//   } catch (error) {
//     console.error("❌ Error adding activity:", error.message);
//     res.status(500).json({ error: "Failed to add activity" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ===================== OOP CLASS ======================
class ActivityLogController {
  constructor(pool) {
    this.pool = pool;
  }

  // Helper method to log activity
  logActivity = async (activity_type, description) => {
    try {
      await this.pool.query(
        `INSERT INTO activity_log (activity_type, description, created_at)
         VALUES ($1, $2, NOW())`,
        [activity_type, description]
      );
    } catch (error) {
      console.error("❌ Error logging activity:", error.message);
    }
  };

  // Get all logs
  getAllActivities = async (req, res) => {
    try {
      const result = await this.pool.query(
        "SELECT * FROM activity_log ORDER BY created_at DESC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("❌ Error fetching activities:", error.message);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  };

  // Add new log entry
  addActivity = async (req, res) => {
    try {
      const { activity_type, description } = req.body;

      await this.logActivity(activity_type, description);

      res.json({
        success: true,
        message: "Activity added successfully",
      });
    } catch (error) {
      console.error("❌ Error adding activity:", error.message);
      res.status(500).json({ error: "Failed to add activity" });
    }
  };
}

// Create controller instance
const activityController = new ActivityLogController(pool);

// ===================== ROUTES ======================
router.get("/", activityController.getAllActivities);
router.post("/", activityController.addActivity);

// Export final router
module.exports = router;
