// backend/routes/theme.js
const express = require("express");
const pool = require("../config/db");

class ThemeController {
  constructor() {
    this.ensureThemeTable();
  }

  // Ensure table exists with all columns and default theme
  ensureThemeTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS theme (
          id SERIAL PRIMARY KEY,
          header_bg VARCHAR(20),
          text_color VARCHAR(20),
          heading_color VARCHAR(20),
          subheading_color VARCHAR(20),
          button_color VARCHAR(20),
          page_bg VARCHAR(20),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      const result = await pool.query("SELECT * FROM theme LIMIT 1");
      if (result.rows.length === 0) {
        await pool.query(
          `INSERT INTO theme 
            (header_bg, text_color, heading_color, subheading_color, button_color, page_bg)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          ["#111827", "#111827", "#1f2937", "#4b5563", "#7c3aed", "#f3f4f6"]
        );
        console.log("🎨 Default theme created");
      } else {
        console.log("🎨 Theme already exists");
      }
    } catch (err) {
      console.error("❌ Error initializing theme table:", err);
    }
  };

  // Get theme
  getTheme = async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM theme LIMIT 1");
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Theme not found" });

      res.json(result.rows[0]);
    } catch (err) {
      console.error("❌ Error fetching theme:", err);
      res.status(500).json({ error: "Failed to fetch theme" });
    }
  };

  // Update theme
  updateTheme = async (req, res) => {
    const { header_bg, text_color, heading_color, subheading_color, button_color, page_bg } = req.body;

    if (!header_bg || !text_color || !heading_color || !subheading_color || !button_color || !page_bg) {
      return res.status(400).json({ error: "All color fields are required" });
    }

    try {
      const result = await pool.query(
        `UPDATE theme
         SET header_bg=$1, text_color=$2, heading_color=$3, subheading_color=$4, button_color=$5, page_bg=$6
         WHERE id=(SELECT id FROM theme LIMIT 1)
         RETURNING *`,
        [header_bg, text_color, heading_color, subheading_color, button_color, page_bg]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Theme not found to update" });
      }

      res.json({ message: "Theme updated successfully", theme: result.rows[0] });
    } catch (err) {
      console.error("❌ Error updating theme:", err);
      res.status(500).json({ error: "Failed to update theme" });
    }
  };

  // Reset theme to default
  resetTheme = async (req, res) => {
    const defaultTheme = {
      header_bg: "#111827",
      text_color: "#111827",
      heading_color: "#1f2937",
      subheading_color: "#4b5563",
      button_color: "#7c3aed",
      page_bg: "#f3f4f6",
    };

    try {
      const result = await pool.query(
        `UPDATE theme
         SET header_bg=$1, text_color=$2, heading_color=$3, subheading_color=$4, button_color=$5, page_bg=$6
         WHERE id=(SELECT id FROM theme LIMIT 1)
         RETURNING *`,
        [
          defaultTheme.header_bg,
          defaultTheme.text_color,
          defaultTheme.heading_color,
          defaultTheme.subheading_color,
          defaultTheme.button_color,
          defaultTheme.page_bg,
        ]
      );

      res.json({ message: "Theme reset to default", theme: result.rows[0] });
    } catch (err) {
      console.error("❌ Error resetting theme:", err);
      res.status(500).json({ error: "Failed to reset theme" });
    }
  };
}

// Router
const router = express.Router();
const themeController = new ThemeController();

router.get("/theme", themeController.getTheme);
router.put("/theme/update", themeController.updateTheme);
router.post("/theme/reset", themeController.resetTheme);

module.exports = router;
