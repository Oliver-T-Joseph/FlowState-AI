# Creative Task Coach

> An AI-powered web app that helps creative professionals decide what to work on — and how to begin.

---

## Problem Statement

Creative professionals often struggle to decide what to work on first because creative tasks vary widely in urgency, complexity, effort, and impact. Traditional to-do lists organize tasks, but they do not help creators understand which task deserves attention first or how demanding each task may be.

---

## Solution Description

Our solution is an AI-powered creative task coach that helps creative workers decide how to begin their work. Users enter a task, and the app evaluates it based on difficulty, estimated time, urgency, creative effort, and importance. The app then gives the user a suggested first step and a short explanation.

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
│  3. The backend stores the task in a SQLite database.      │
│                                                            │
│  4. The AI service evaluates the task using OpenAI and     │
│     returns a structured JSON response containing:         │
│       • Difficulty score   (1–5)                           │
│       • Estimated time     (minutes)                       │
│       • Urgency level      (Low / Medium / High)           │
│       • Creative effort    (Light / Moderate / Deep Focus) │
│       • Suggested first step                               │
│       • Plain-language explanation                         │
│                                                            │
│  5. The backend stores the AI evaluation alongside         │
│     the original task record.                              │
│                                                            │
│  6. The frontend receives the evaluation and displays      │
│     the advice to the user.                                │
└────────────────────────────────────────────────────────────┘
```

---

## Technology Used

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | User interface — task entry form and results display |
| Backend | Node.js, Express | REST API server — routes and request handling |
| Database | SQLite | Persistent storage for tasks and AI evaluations |
| AI | OpenAI API (structured output / JSON schema) | Task evaluation — scoring, effort rating, first-step advice |
| Dev tooling | dotenv | Environment variable management (API keys) |
| Assistant | IBM Bob | Code generation, debugging, and README authoring (see below) |

---

## How IBM Bob Was Used

IBM Bob was used throughout the development of this project as a coding assistant and documentation partner:

- **Debugging** — Identified and explained issues in the backend and frontend code, including API integration errors and response-handling bugs.
- **Code generation** — Helped scaffold the Express server, the OpenAI structured-output integration in `aiService.js`, and the SQLite database layer in `database.js`.
- **Schema design** — Assisted in designing the JSON evaluation schema (difficulty score, urgency, creative effort, suggested first step) used to enforce structured responses from the OpenAI API.
- **Documentation** — Wrote and refined this README, ensuring the problem statement, solution description, and architecture flow were clearly expressed.
- **Code review** — Reviewed code for correctness, best practices, and potential runtime errors before testing.

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
    ├── database.js      # SQLite setup and query helpers
    ├── aiService.js     # OpenAI integration and evaluation logic
    └── package.json     # Dependencies and start scripts
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
   OPENAI_MODEL=gpt-4o
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `frontend/index.html` in a browser.

---

## Future Improvements

- **User accounts** — Allow users to save and revisit past task evaluations across sessions.
- **Task prioritization view** — Display all saved tasks ranked by urgency and difficulty so users can see their full workload at a glance.
- **Real AI model integration** — Replace or augment the current OpenAI call with a fine-tuned model trained specifically on creative workflow patterns.
- **Mobile-responsive design** — Optimize the frontend layout for phones and tablets.
- **Export to calendar** — Let users export the suggested first step and estimated time directly to Google Calendar or iCal.
- **Team mode** — Support multiple users on a shared task board so creative teams can coach each other.

---

## Team Members

| Name | Role |
|---|---|
| Oliver Joseph | Backend |
| Graham Tucker-Camou | Backend |
| Drew Hall | Frontend |
| Allie Estes | Documentation |
| Yoni Mendez Antonio | Frontend |
> Replace the placeholders above with your team's actual names and roles before submitting.

---

*Built for the IBM July Coding Challenge.*
README.md
Displaying README.md.
