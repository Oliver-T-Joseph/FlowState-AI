# Creative Task Coach

> An AI-powered single-task analyzer that helps creative professionals understand and begin their work.

---

## Problem Statement

Creative professionals often struggle to decide how to begin a task because creative work varies widely in urgency, complexity, effort, and impact. This tool evaluates any individual creative task and gives the user concrete, actionable guidance on where to start.

---

## Solution Description

Creative Task Coach is an AI-powered single-task analyzer. The user submits one creative task at a time, and the app evaluates it based on difficulty, estimated time, urgency, creative effort, and importance. The app then provides a suggested first step and a plain-language explanation of the evaluation.

Tasks and evaluations are **not stored**. Refreshing or closing the page does not preserve an analysis. The backend exists to protect the OpenAI API key and communicate securely with the OpenAI API — it does not persist any data.

---

## How It Works

```
┌────────────────────────────────────────────────────────────┐
│  1. User enters a task (title, description, due date,      │
│     category, importance) in the browser.                  │
│                                                            │
│  2. The frontend sends the task to the Express backend     │
│     via a POST request.                                    │
│                                                            │
│  3. The backend requests a structured evaluation from      │
│     OpenAI and returns a JSON response containing:         │
│       • Difficulty score   (1–5)                           │
│       • Estimated time     (minutes)                       │
│       • Urgency level      (Low / Medium / High)           │
│       • Creative effort    (Light / Moderate / Deep Focus) │
│       • Suggested first step                               │
│       • Plain-language explanation                         │
│                                                            │
│  4. The frontend immediately displays the evaluation.      │
└────────────────────────────────────────────────────────────┘
```

---

## Technology Used

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | User interface — task entry form and results display |
| Backend | Node.js, Express | REST API server — routes and request handling |
| AI | OpenAI API (structured output / JSON schema) | Task evaluation — scoring, effort rating, first-step advice |
| Dev tooling | dotenv | Environment variable management (API keys) |
| Dev tooling | CORS | Cross-origin request handling |
| Assistant | IBM Bob | Development assistance (see below) |

---

## How IBM Bob Was Used

IBM Bob was used throughout the development of this project as a coding assistant and documentation partner:

- **Express backend development** — Helped scaffold the Express server, routes, request validation, and error handling in `server.js`.
- **OpenAI integration** — Assisted with the structured-output integration in `aiService.js`, including the JSON schema, response validation, and error handling for API failures.
- **Structured JSON schema** — Assisted in designing the evaluation schema (difficulty score, urgency, creative effort, suggested first step) used to enforce structured responses from the OpenAI API.
- **Debugging** — Identified and explained issues in the backend and frontend code, including API integration errors and response-handling bugs.
- **Documentation** — Wrote and refined this README, ensuring the problem statement, solution description, and architecture flow were clearly expressed.
- **Repository cleanup** — Assisted with removing unnecessary persistence code (database layer, SQL inserts, grading feature) to simplify the application to a single-task analyzer.

---

## Project Structure

```
IBM_JulyCodingChallenge/
├── frontend/
│   ├── index.html       # Task entry form and results display
│   ├── style.css        # Page styling
│   └── script.js        # Fetch calls and DOM updates
└── backend/
    ├── server.js        # Express server and API routes
    ├── aiService.js     # OpenAI integration and evaluation logic
    ├── testOpenAI.js    # Quick script to verify the OpenAI connection
    ├── package.json     # Dependencies and start scripts
    └── package-lock.json
```

---

## Getting Started

**Prerequisites:** Node.js 18+, an OpenAI API key.

1. Clone the repository.
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create a `.env` file inside `backend/`:
   ```
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-5-mini
   PORT=3000
   ```
   > `PORT=3000` must match the URL used by `frontend/script.js` (`http://localhost:3000/api/tasks`). If you change the port here you must also update that URL in the frontend.
4. Start the server:
   ```bash
   npm start
   ```
5. Open `frontend/index.html` directly in a browser.

No database setup, migration, or initialization is required.

---

## Future Improvements

- **Better task input guidance** — Add placeholder text and inline tips to help users write more useful task descriptions.
- **More detailed evaluation categories** — Expand the evaluation to include additional dimensions such as risk level or collaboration requirements.
- **Adjustable analysis styles** — Let users choose between a brief or detailed evaluation style.
- **Improved mobile responsiveness** — Optimize the frontend layout for phones and tablets.
- **Export or copy an individual evaluation** — Add a button to copy the evaluation to the clipboard or export it as a text file.
- **Additional validation and accessibility** — Improve form validation messages and keyboard/screen-reader accessibility.

---

## Team Members

| Name | Role |
|---|---|
| Oliver Joseph | Backend |
| Graham Tucker-Camou | Backend |
| Drew Hall | Frontend |
| Allie Estes | Documentation |
| Yoni Mendez Antonio | Frontend |

---

*Built for the IBM July Coding Challenge.*
