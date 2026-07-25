// ============================================================
// script.js — Creative Task Coach
// ============================================================
// HOW THIS FILE WORKS:
// 1. We wait for the page to fully load.
// 2. We find the form and listen for its "submit" event.
// 3. We read each field value and do basic validation.
// 4. We send the data to the backend using fetch().
// 5. We wait for the backend to respond with the AI evaluation.
// 6. We call showResult() to display the evaluation on the page,
//    or showError() if something went wrong.
//
// WHAT IS fetch()?
// fetch() is a built-in browser function that sends an HTTP request
// to a URL — in this case our Node.js backend — and returns the
// response as a Promise. A Promise is JavaScript's way of saying
// "I'll give you the answer when it's ready."
//
// WHAT IS async / await?
// async and await make it easy to work with Promises.
// - Mark a function with "async" to allow awaiting inside it.
// - Put "await" before a Promise to pause until the answer arrives,
//   without freezing the rest of the browser.
// ============================================================


// ── Backend URL ──────────────────────────────────────────────
// PORT=3000 is set in backend/.env — update this if you change it.
var TASKS_URL = "http://localhost:3000/api/tasks";


// Wait until the browser has finished building the page (the DOM)
// before we try to find any elements on it.
document.addEventListener("DOMContentLoaded", function () {

  // ── Find elements we will use later ─────────────────────
  var form          = document.getElementById("task-form");
  var submitButton  = document.getElementById("submit-btn");
  var resultCard    = document.getElementById("result-card");
  var loadingMsg    = document.getElementById("result-loading");

  // ── Listen for form submission ───────────────────────────
  // The "submit" event fires when the user clicks "Analyze Task".
  form.addEventListener("submit", async function (event) {

    // Stop the browser from reloading the page on submit.
    event.preventDefault();

    // ── Collect field values ──────────────────────────────
    // .value = what the user typed / selected
    // .trim() = removes accidental spaces at the start/end
    var title       = document.getElementById("task-title").value.trim();
    var description = document.getElementById("task-description").value.trim();
    var dueDate     = document.getElementById("due-date").value;   // "YYYY-MM-DD" or ""
    var category    = document.getElementById("category").value;
    var importance  = document.getElementById("importance").value;

    // ── Basic validation ──────────────────────────────────
    // Require at least a title before sending anything to the backend.
    if (title === "") {
      alert("Please enter a Task Title before analyzing.");
      document.getElementById("task-title").focus();
      return; // stop — do not make the API call
    }

    // ── Bundle the values into one object ─────────────────
    // This is the exact shape the backend's POST /api/tasks expects.
    var taskData = {
      title:       title,
      description: description,
      dueDate:     dueDate,
      category:    category,
      importance:  importance,
    };

    // ── Log to console for debugging ──────────────────────
    console.log("--- Sending to backend ---");
    console.log(taskData);

    // ── Show loading state ────────────────────────────────
    // 1. Disable the button so the user cannot submit twice.
    // 2. Reveal the result card with only the loading message visible.
    submitButton.disabled = true;
    showLoading(resultCard, loadingMsg);

    // ── Send the data to the backend ──────────────────────
    // We wrap the fetch() call in try/catch so that if anything
    // goes wrong (network error, server error) we can show a
    // helpful message instead of a blank page.
    try {

      // fetch() sends an HTTP POST request to the backend URL.
      // We pass a "config" object as the second argument:
      //   method  – "POST" means we are sending data (not just reading it)
      //   headers – tells the backend the body is JSON text
      //   body    – the actual data, converted to a JSON string
      var response = await fetch(TASKS_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(taskData),
      });

      // response.json() reads the response body and parses it
      // from a JSON string into a JavaScript object.
      // We await it because reading the body is also async.
      var data = await response.json();

      // ── Check for server-side errors ──────────────────
      // A non-OK status code (e.g. 400, 500) means the backend
      // reported a problem. We read the error message it sent back.
      if (!response.ok) {
        // data.error is the message our backend puts in the response
        // when something goes wrong (see server.js).
        throw new Error(data.error || "The server returned an error.");
      }

      // ── Log the full response for debugging ───────────
      console.log("--- Response from backend ---");
      console.log(data);

      // ── Display the evaluation ────────────────────────
      // data.evaluation is the object returned by aiService.js.
      // It contains: difficulty_score, estimated_time, urgency_level,
      // creative_effort, suggested_first_step, explanation.
      showResult(data.evaluation, resultCard, loadingMsg);

    } catch (err) {

      // Something went wrong — network down, server error, etc.
      console.error("Fetch error:", err.message);
      showError(err.message, resultCard, loadingMsg);

    } finally {

      // Re-enable the button whether the request succeeded or failed,
      // so the user can try again.
      submitButton.disabled = false;

    }

  }); // end submit listener

}); // end DOMContentLoaded


// ============================================================
// showLoading(cardElement, loadingElement)
// ============================================================
// Makes the result card visible and shows only the loading
// message while hiding the metric grid and other content.
// ============================================================
function showLoading(cardElement, loadingElement) {
  // Show the card shell
  cardElement.classList.remove("hidden");

  // Show the "Analyzing..." text
  loadingElement.classList.remove("hidden");

  // Hide any previous error that might still be in the card
  var existingError = cardElement.querySelector(".result-error");
  if (existingError) {
    existingError.remove();
  }

  // Hide the result content sections until data arrives
  cardElement.querySelector(".result-grid").classList.add("hidden");
  cardElement.querySelector(".result-step").classList.add("hidden");
  cardElement.querySelector(".result-explanation").classList.add("hidden");

  // Scroll to the card so the user sees the loading message
  cardElement.scrollIntoView({ behavior: "smooth", block: "start" });
}


// ============================================================
// showResult(evaluation, cardElement, loadingElement)
// ============================================================
// Fills in each result slot with values from the AI evaluation,
// hides the loading message, and reveals the content sections.
//
// The evaluation object has these fields (from aiService.js):
//   difficulty_score     – integer 1–5
//   estimated_time       – integer (minutes)
//   urgency_level        – "Low" | "Medium" | "High"
//   creative_effort      – "Light" | "Moderate" | "Deep Focus"
//   suggested_first_step – string
//   explanation          – string
// ============================================================
function showResult(evaluation, cardElement, loadingElement) {

  // ── Format the values for display ───────────────────────
  // The AI returns raw numbers/strings; we make them readable here.

  // Show difficulty as "X / 5"
  document.getElementById("result-difficulty").textContent =
    evaluation.difficulty_score + " / 5";

  // Convert minutes to a human-friendly string, e.g. "90 min" → "1 h 30 min"
  document.getElementById("result-time").textContent =
    formatMinutes(evaluation.estimated_time);

  document.getElementById("result-urgency").textContent =
    evaluation.urgency_level;

  document.getElementById("result-effort").textContent =
    evaluation.creative_effort;

  document.getElementById("result-first-step").textContent =
    evaluation.suggested_first_step;

  document.getElementById("result-explanation").textContent =
    evaluation.explanation;

  // ── Reveal the content, hide the loading message ────────
  loadingElement.classList.add("hidden");
  cardElement.querySelector(".result-grid").classList.remove("hidden");
  cardElement.querySelector(".result-step").classList.remove("hidden");
  cardElement.querySelector(".result-explanation").classList.remove("hidden");
}


// ============================================================
// showError(message, cardElement, loadingElement)
// ============================================================
// Hides the loading message and shows a red error banner
// inside the result card so the user understands what went wrong.
// ============================================================
function showError(message, cardElement, loadingElement) {
  // Hide the loading text
  loadingElement.classList.add("hidden");

  // Create a new paragraph with the error class and insert it
  // after the loading message (before the title).
  var errorEl = document.createElement("p");
  errorEl.className = "result-error";
  errorEl.textContent = "Something went wrong: " + message;

  // Insert the error element right after the loading message
  loadingElement.insertAdjacentElement("afterend", errorEl);

  // Make sure the metric sections stay hidden — there is no data to show
  cardElement.querySelector(".result-grid").classList.add("hidden");
  cardElement.querySelector(".result-step").classList.add("hidden");
  cardElement.querySelector(".result-explanation").classList.add("hidden");
}


// ============================================================
// formatMinutes(minutes)
// ============================================================
// Converts a plain number of minutes into a readable string.
// Examples:
//   45  → "45 min"
//   60  → "1 hr"
//   90  → "1 hr 30 min"
//   120 → "2 hrs"
// ============================================================
function formatMinutes(minutes) {
  if (minutes < 60) {
    return minutes + " min";
  }

  var hours = Math.floor(minutes / 60);
  var mins  = minutes % 60;
  var hourLabel = hours === 1 ? "hr" : "hrs";

  if (mins === 0) {
    return hours + " " + hourLabel;
  }

  return hours + " " + hourLabel + " " + mins + " min";
}
