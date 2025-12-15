/**
 * Portfolio Backend API
 * Tech: Node.js + Express + MongoDB (Mongoose)
 * Single-file setup
 * Features:
 * - Projects CRUD (Live + Source links)
 * - Contact form (store messages)
 * - Admin can view & delete contacts
 * - CORS enabled
 * - Replit & Render ready
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json());

/* =====================
   MONGODB CONNECTION
===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

/* =====================
   SCHEMAS
===================== */

/* PROJECT SCHEMA */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["static", "fullstack", "ai", "automation", "hacking"],
      required: true
    },
    stack: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },

    /* BOTH LINKS ALLOWED */
    liveLink: {
      type: String,
      default: ""
    },
    sourceLink: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

/* CONTACT SCHEMA */
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
const Contact = mongoose.model("Contact", contactSchema);

/* =====================
   ROUTES
===================== */

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.json({ status: "API running 🚀" });
});

/* ========= PROJECT ROUTES ========= */

/* GET all projects */
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

/* GET single project */
app.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: "Invalid project ID" });
  }
});

/* ADD project (ADMIN) */
app.post("/projects", async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({
      error: "Invalid project data",
      details: err.message
    });
  }
});

/* UPDATE project (ADMIN) */
app.put("/projects/:id", async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      error: "Update failed",
      details: err.message
    });
  }
});

/* DELETE project (ADMIN) */
app.delete("/projects/:id", async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

/* ========= CONTACT ROUTES ========= */

/* SUBMIT contact form (PUBLIC) */
app.post("/contact", async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({
      success: true,
      message: "Message received"
    });
  } catch (err) {
    res.status(400).json({
      error: "Invalid contact data",
      details: err.message
    });
  }
});

/* GET all contact messages (ADMIN) */
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

/* DELETE contact message (ADMIN) */
app.delete("/contacts/:id", async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

/* =====================
   START SERVER
===================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
