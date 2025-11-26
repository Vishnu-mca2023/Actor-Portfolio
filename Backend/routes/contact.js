// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db"); // your PostgreSQL pool

// // ✅ Get Contact Info
// router.get("/", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM contact_info ORDER BY id DESC LIMIT 1");
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "❌ Contact info not found" });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("❌ Error fetching contact info:", err);
//     res.status(500).json({ message: "❌ Server error" });
//   }
// });

// // ✅ Update Contact Info (Admin)
// router.put("/", async (req, res) => {
//   try {
//     const { address, phone, email } = req.body;

//     const existing = await pool.query("SELECT * FROM contact_info ORDER BY id DESC LIMIT 1");
//     if (existing.rows.length === 0) {
//       // Insert if not exists
//       const insertResult = await pool.query(
//         "INSERT INTO contact_info (address, phone, email) VALUES ($1, $2, $3) RETURNING *",
//         [address, phone, email]
//       );
//       return res.json({ message: "✅ Contact info created", contact: insertResult.rows[0] });
//     }

//     // Update existing
//     const result = await pool.query(
//       "UPDATE contact_info SET address=$1, phone=$2, email=$3, updated_at=NOW() WHERE id=$4 RETURNING *",
//       [address, phone, email, existing.rows[0].id]
//     );

//     res.json({ message: "✅ Contact info updated", contact: result.rows[0] });
//   } catch (err) {
//     console.error("❌ Error updating contact info:", err);
//     res.status(500).json({ message: "❌ Server error" });
//   }
// });



// router.post("/message", async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     if (!name || !email || !message) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All fields are required" });
//     }

//     const result = await pool.query(
//       "INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3) RETURNING *",
//       [name, email, message]
//     );

//     res
//       .status(201)
//       .json({ success: true, message: "Message sent successfully", contact: result.rows[0] });
//   } catch (err) {
//     console.error("❌ Error submitting contact message:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ✅ Get All Contact Messages (Admin)
// router.get("/messages", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM contact_messages ORDER BY created_at DESC"
//     );
//     res.json({ success: true, messages: result.rows });
//   } catch (err) {
//     console.error("❌ Error fetching messages:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// =====================================================
//          ⭐ OOP Class for Contact Operations
// =====================================================
class ContactController {
  // 1️⃣ Get single contact info
  async getContactInfo(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM contact_info ORDER BY id DESC LIMIT 1"
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "❌ Contact info not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("❌ Error fetching contact info:", err);
      res.status(500).json({ message: "❌ Server error" });
    }
  }

  // 2️⃣ Update or Insert contact info
  async updateContactInfo(req, res) {
    try {
      const { address, phone, email } = req.body;

      const existing = await pool.query(
        "SELECT * FROM contact_info ORDER BY id DESC LIMIT 1"
      );

      if (existing.rows.length === 0) {
        // Insert new contact info
        const insertResult = await pool.query(
          "INSERT INTO contact_info (address, phone, email) VALUES ($1, $2, $3) RETURNING *",
          [address, phone, email]
        );

        return res.json({
          message: "✅ Contact info created",
          contact: insertResult.rows[0],
        });
      }

      // Update existing
      const result = await pool.query(
        "UPDATE contact_info SET address=$1, phone=$2, email=$3, updated_at=NOW() WHERE id=$4 RETURNING *",
        [address, phone, email, existing.rows[0].id]
      );

      res.json({
        message: "✅ Contact info updated",
        contact: result.rows[0],
      });
    } catch (err) {
      console.error("❌ Error updating contact info:", err);
      res.status(500).json({ message: "❌ Server error" });
    }
  }

  // 3️⃣ Add a contact message
  async submitMessage(req, res) {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      const result = await pool.query(
        "INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3) RETURNING *",
        [name, email, message]
      );

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        contact: result.rows[0],
      });
    } catch (err) {
      console.error("❌ Error submitting contact message:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // 4️⃣ Get all contact messages (Admin)
  async getAllMessages(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM contact_messages ORDER BY created_at DESC"
      );

      res.json({
        success: true,
        messages: result.rows,
      });
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

// Create object instance
const contactController = new ContactController();

// =====================================================
//                    ⭐ Routes
// =====================================================

// Get contact info
router.get("/", (req, res) =>
  contactController.getContactInfo(req, res)
);

// Update contact info
router.put("/", (req, res) =>
  contactController.updateContactInfo(req, res)
);

// Add a message
router.post("/message", (req, res) =>
  contactController.submitMessage(req, res)
);

// Get all messages
router.get("/messages", (req, res) =>
  contactController.getAllMessages(req, res)
);

module.exports = router;
