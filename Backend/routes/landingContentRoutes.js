// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db");

// // Get Landing Content
// router.get("/", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM landing_content ORDER BY id DESC LIMIT 1");
//     res.json({ data: result.rows[0] || { heading: "", paragraph: "", tagline: "" } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch landing content" });
//   }
// });

// // Update or Insert Landing Content (UPSERT)
// router.post("/", async (req, res) => {
//   const { heading, paragraph, tagline } = req.body;

//   if (!heading && !paragraph && !tagline) {
//     return res.status(400).json({ error: "No data provided" });
//   }

//   try {
//     const result = await pool.query(
//       `
//       INSERT INTO landing_content (id, heading, paragraph, tagline)
//       VALUES (1, $1, $2, $3)
//       ON CONFLICT (id)
//       DO UPDATE SET
//         heading = EXCLUDED.heading,
//         paragraph = EXCLUDED.paragraph,
//         tagline = EXCLUDED.tagline,
//         updated_at = CURRENT_TIMESTAMP
//       RETURNING *
//       `,
//       [heading, paragraph, tagline]
//     );

//     res.json({ data: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update landing content" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ---------------- OOP CLASS ---------------- //

class LandingContentRoute {
  // Fetch landing content
  async getLandingContent(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM landing_content ORDER BY id DESC LIMIT 1"
      );

      res.json({
        data: result.rows[0] || {
          heading: "",
          paragraph: "",
          tagline: "",
        },
      });
    } catch (err) {
      console.error("Error fetching landing content:", err);
      res.status(500).json({ error: "Failed to fetch landing content" });
    }
  }

  // Update or Insert landing content (Upsert)
  async upsertLandingContent(req, res) {
    const { heading, paragraph, tagline } = req.body;

    if (!heading && !paragraph && !tagline) {
      return res.status(400).json({ error: "No data provided" });
    }

    try {
      const result = await pool.query(
        `
        INSERT INTO landing_content (id, heading, paragraph, tagline)
        VALUES (1, $1, $2, $3)
        ON CONFLICT (id)
        DO UPDATE SET
          heading = EXCLUDED.heading,
          paragraph = EXCLUDED.paragraph,
          tagline = EXCLUDED.tagline,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [heading, paragraph, tagline]
      );

      res.json({ data: result.rows[0] });
    } catch (err) {
      console.error("Error updating landing content:", err);
      res.status(500).json({ error: "Failed to update landing content" });
    }
  }
}

// Create object of the class
const landingContent = new LandingContentRoute();

// ---------------- ROUTES ---------------- //

router.get("/", (req, res) => landingContent.getLandingContent(req, res));
router.post("/", (req, res) => landingContent.upsertLandingContent(req, res));

module.exports = router;
