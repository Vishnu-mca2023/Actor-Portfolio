// scheduler.js
const cron = require("node-cron");
const pool = require("./config/db");

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date().toISOString();
    // Publish scheduled posts whose scheduled_at <= now
    const result = await pool.query(
      `UPDATE posts
       SET status = 'published', is_draft = false, updated_at = NOW()
       WHERE status = 'scheduled' AND scheduled_at <= $1
       RETURNING id, title, scheduled_at`,
      [now]
    );

    if (result.rows.length > 0) {
      console.log(`📢 ${result.rows.length} scheduled post(s) auto-published`);

      // Insert activity logs in batch
      const values = result.rows.map(
        (row, i) => `('Published', 'Scheduled post auto-published: "${row.title}"', NOW())`
      );
      await pool.query(
        `INSERT INTO activity_log (activity_type, description, created_at) VALUES ${values.join(",")}`
      );
    }
  } catch (error) {
    console.error("❌ Scheduling Error:", error);
  }
});
