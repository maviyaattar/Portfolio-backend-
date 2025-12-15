
/**
 * Portfolio Backend API
 * Tech: Node.js + Express + MongoDB (Mongoose)
 * UPDATED:
 * - image OPTIONAL
 * - multiple categories allowed
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

    /* IMAGE OPTIONAL */
    image: {
      type: String,
      default: ""
    },

    /* MULTIPLE CATEGORIES */
    categories: {
      type: [String],
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

/* GET ALL PROJECTS */
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

/* ADD PROJECT */
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

/* UPDATE PROJECT */
app.put("/projects/:id", async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Update failed" });
  }
});

/* DELETE PROJECT */
app.delete("/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Delete failed" });
  }
});

/* CONTACT ROUTES */
app.post("/contact", async (req, res) => {
  try {
    await Contact.create(req.body);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Invalid contact data" });
  }
});

app.get("/contacts", async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

app.delete("/contacts/:id", async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =====================
   START SERVER
===================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
