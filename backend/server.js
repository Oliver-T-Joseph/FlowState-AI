// ─── Imports ────────────────────────────────────────────────────────────────
const express = require("express");
const cors = require("cors");

// Import the three helpers from our database module:
//   initDb  – call once at startup to load/create the database file
//   getDb   – call anywhere you need to run a query
//   saveDb  – call after any write (INSERT / UPDATE / DELETE) to persist to disk
const { initDb, getDb, saveDb } = require("./database");

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
app.post("/api/tasks", (req, res) => {
  // Destructure the expected fields from the request body
  const { title, description, dueDate, category, importance } = req.body;

  // Basic check: title is the minimum required field
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  try {
    // Get the live database instance
    const db = getDb();

    // ── INSERT the task into the `tasks` table ───────────────────────────────
    // We use a "prepared statement" with named placeholders (:title, :description …)
    // to safely pass values – this prevents SQL injection attacks.
    db.run(
      `INSERT INTO tasks (title, description, due_date, category, importance)
       VALUES (:title, :description, :due_date, :category, :importance)`,
      {
        ":title":       title,
        ":description": description  || null, // store NULL if not provided
        ":due_date":    dueDate       || null,
        ":category":    category      || null,
        ":importance":  importance    || null,
      }
    );

    // ── Retrieve the id that SQLite gave to the new row ──────────────────────
    // `lastInsertRowid` is a sql.js method that returns the id of the most
    // recently inserted row in this database connection.
    const newId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];

    // ── Save the updated database to disk ────────────────────────────────────
    saveDb();

    // ── Respond with the saved task data ─────────────────────────────────────
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
    });
  } catch (err) {
    // Something went wrong with the database – log it and tell the client
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Failed to save task." });
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
