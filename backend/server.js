// ─── Imports ────────────────────────────────────────────────────────────────
// dotenv loads the variables in backend/.env into process.env so we can
// read PORT, OPENAI_API_KEY etc. without hard-coding them here.
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import the AI evaluation helper.
// evaluateCreativeTask() sends the task to OpenAI and returns
// a structured evaluation object.
const { evaluateCreativeTask } = require("./aiService");

// ─── App Setup ──────────────────────────────────────────────────────────────
const app = express();

// Read PORT from the .env file (PORT=3000) so the server and frontend agree.
// Falls back to 3001 if the variable is not set.
const PORT = process.env.PORT || 3001;

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
 * Receives a task from the frontend, sends it to OpenAI for evaluation,
 * and returns the structured evaluation result.
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
app.post("/api/tasks", async (req, res) => {
  // Destructure the expected fields from the request body
  const { title, description, dueDate, category, importance } = req.body;

  // Basic check: title is the minimum required field
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  try {
    // Ask the AI to evaluate the task.
    // evaluateCreativeTask() calls OpenAI and returns a structured object.
    const evaluation = await evaluateCreativeTask({
      title,
      description,
      dueDate,
      category,
      importance,
    });

    // Respond with the task echo and the AI evaluation.
    // The frontend reads the `evaluation` key to populate the result card.
    res.status(201).json({
      message: "Task analyzed!",
      task: {
        title,
        description: description || null,
        due_date:    dueDate     || null,
        category:    category    || null,
        importance:  importance  || null,
      },
      evaluation,  // e.g. { difficulty_score, estimated_time, urgency_level, ... }
    });
  } catch (err) {
    console.error("Error handling task:", err.message);
    res.status(500).json({ error: err.message || "Failed to process task." });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
