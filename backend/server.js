// ─── Imports ────────────────────────────────────────────────────────────────
const express = require("express");
const cors = require("cors");

// Import the three helpers from our database module:
//   initDb  – call once at startup to load/create the database file
//   getDb   – call anywhere you need to run a query
//   saveDb  – call after any write (INSERT / UPDATE / DELETE) to persist to disk
const { initDb, getDb, saveDb } = require("./database");

// Import the AI evaluation helper.
// evaluateCreativeTask() sends the task to OpenAI and returns
// a structured evaluation object.
const { evaluateCreativeTask } = require("./aiService");

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
 * Receives a new task from the frontend, saves it to the database,
 * and returns the saved task (including its new auto-generated id).
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
// The route handler is now async so we can use await with the AI call.
app.post("/api/tasks", async (req, res) => {
  // Destructure the expected fields from the request body
  const { title, description, dueDate, category, importance } = req.body;

  // Basic check: title is the minimum required field
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  try {
    // ── Step 1: Save the task to the database ────────────────────────────────
    const db = getDb();

    db.run(
      `INSERT INTO tasks (title, description, due_date, category, importance)
       VALUES (:title, :description, :due_date, :category, :importance)`,
      {
        ":title":       title,
        ":description": description  || null,
        ":due_date":    dueDate       || null,
        ":category":    category      || null,
        ":importance":  importance    || null,
      }
    );

    const newId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];
    saveDb();

    // ── Step 2: Ask the AI to evaluate the task ──────────────────────────────
    // evaluateCreativeTask() calls OpenAI and returns a structured object.
    // It is async, so we use await to wait for it to finish before continuing.
    const evaluation = await evaluateCreativeTask({
      title,
      description,
      dueDate,
      category,
      importance,
    });

    // ── Step 3: Respond with both the saved task and the AI evaluation ───────
    // The frontend reads the `evaluation` key to populate the result card.
    res.status(201).json({
      message: "Task saved!",
      task: {
        id:          newId,
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
// We must wait for the database to be ready before accepting requests,
// so we wrap the app.listen call inside the async initDb() call.
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialise database:", err.message);
    process.exit(1); // stop the process if the database can't start
  });
