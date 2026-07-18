// ─── Imports ────────────────────────────────────────────────────────────────
const express = require("express");
const cors = require("cors");

// ─── App Setup ──────────────────────────────────────────────────────────────
const app = express();
const PORT = 3001;

// ─── Middleware ──────────────────────────────────────────────────────────────
// Allow requests from any origin (e.g. the React frontend on localhost:3000)
app.use(cors());

// Parse incoming JSON request bodies so we can read req.body
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * A simple health-check route to confirm the server is up and running.
 */
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is running" });
});

/**
 * POST /api/tasks
 * Receives a new task from the frontend and echoes it back as JSON.
 *
 * Expected request body:
 * {
 *   title       : string  – short name for the task
 *   description : string  – longer details about the task
 *   dueDate     : string  – ISO date string (e.g. "2025-08-01")
 *   category    : string  – e.g. "Writing", "Design", "Music"
 *   importance  : string  – e.g. "Low", "Medium", "High"
 * }
 */
app.post("/api/tasks", (req, res) => {
  // Destructure the expected fields from the request body
  const { title, description, dueDate, category, importance } = req.body;

  // Basic check: title is the minimum required field
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  // Build the task object from the received data
  const task = {
    title,
    description,
    dueDate,
    category,
    importance,
  };

  // For now, just return the task data back to the client
  res.status(201).json({ message: "Task received!", task });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
