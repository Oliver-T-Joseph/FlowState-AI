// ─── database.js ─────────────────────────────────────────────────────────────
//
// Sets up a SQLite database using sql.js (pure JavaScript – no compiler needed).
// sql.js keeps the database in memory while the server is running, and we
// manually save it to a file (tasks.db) so data survives server restarts.
//
// HOW IT WORKS:
//   1. When the server starts, we load tasks.db from disk (if it exists).
//   2. Every time we write data, we also save the updated database back to disk.
//   3. We export a `db` object and a `saveDb` helper for use in server.js.
// ─────────────────────────────────────────────────────────────────────────────

const initSqlJs = require("sql.js"); // pure-JS SQLite engine
const fs = require("fs");            // Node built-in: read/write files
const path = require("path");        // Node built-in: build file paths safely

// Where the database file will be stored (same folder as this file)
const DB_PATH = path.join(__dirname, "tasks.db");

// We'll fill this in once sql.js finishes loading (it's async)
let db;

// ─── saveDb ──────────────────────────────────────────────────────────────────
// Call this after any INSERT / UPDATE / DELETE to persist changes to disk.
function saveDb() {
  // Export the in-memory database to a Uint8Array, then write it to the file
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ─── initDb ──────────────────────────────────────────────────────────────────
// Loads (or creates) the database and makes sure both tables exist.
// Returns a Promise so the caller can await it before starting the server.
async function initDb() {
  // sql.js needs to be initialised before we can use it
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    // Database file already exists – load it into memory
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log("Database loaded from", DB_PATH);
  } else {
    // No file yet – create a brand-new empty database
    db = new SQL.Database();
    console.log("New database created at", DB_PATH);
  }

  // ── Create the `tasks` table if it doesn't already exist ──────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT,
      due_date    TEXT,
      category    TEXT,
      importance  TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `);

  // ── Create the `evaluations` table if it doesn't already exist ────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id             INTEGER NOT NULL,
      difficulty_score    INTEGER,
      estimated_time      TEXT,
      urgency_level       TEXT,
      creative_effort     TEXT,
      suggested_first_step TEXT,
      explanation         TEXT,
      created_at          TEXT    DEFAULT (datetime('now')),

      -- Links each evaluation back to the task it belongs to
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);

  // Save now so the file is created on disk immediately
  saveDb();

  return db;
}

// ─── getDb ───────────────────────────────────────────────────────────────────
// Returns the live database instance.
// Always call initDb() once (in server.js) before calling getDb().
function getDb() {
  if (!db) {
    throw new Error("Database has not been initialised. Call initDb() first.");
  }
  return db;
}

// ─── Exports ─────────────────────────────────────────────────────────────────
module.exports = { initDb, getDb, saveDb };
