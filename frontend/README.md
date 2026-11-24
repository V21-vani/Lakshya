# Lakshya Frontend: Layout & Student Portal

React 19 + Vite + Tailwind CSS frontend for the Lakshya placement mentoring platform.

## Run it

The Spring Boot backend must be running on `http://localhost:8080` (see `backend/`).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Vite proxies `/api/*` to the backend, so no CORS setup is needed in development.
To use another backend, set `VITE_API_URL` (e.g. in `frontend/.env.local`).

Demo logins (seeded by the backend): `admin`, `mentor1`, `student1`, all with password `password123`.

## What's here

| Area | Route | Notes |
|------|-------|-------|
| Login / Sign up | `/login`, `/signup` | JWT stored in localStorage, sent as `Authorization: Bearer` |
| Layout | – | Sidebar, Navbar, Loader, Alert, Badge, StatCard in `src/components` |
| Student dashboard | `/dashboard` | Readiness score, stat cards, quiz trend / applications / topic charts (Recharts), activity log |
| Practice list | `/practice` | Search + difficulty/topic filters, solved markers |
| Code workspace | `/practice/:id` | CodeMirror editor, JS / Python / Java / C++, test results panel |
| Quizzes | `/quizzes`, `/quizzes/:id` | Timed quiz with countdown, auto-submit, question navigator, review screen |
| Placement drives | `/drives` | Eligible / Not Eligible / Closed badges, apply confirmation, application status |

**Eligibility rule:** a student's *readiness score* is the average of their quiz percentages.
They're eligible for a drive when it is ≥ the drive's `minimumScore` and the deadline hasn't passed.

## Temporary stand-ins for missing backend features

These live in `src/data/` and `src/api/` so they're easy to swap out:

| Missing backend feature | Stand-in | Swap point |
|---|---|---|
| Drive listing endpoint | Tries `GET /api/drives`, falls back to `SAMPLE_DRIVES` with a warning banner | `drivesApi.list` in `src/api/endpoints.js` |
| Code evaluation | JavaScript runs in a Web Worker in the browser (with time limit); other languages show a notice | `run` in `src/pages/ProblemWorkspacePage.jsx`, `src/api/jsRunner.js` |
| Code submissions storage | Solved problems saved per user in localStorage | `src/data/progress.js` |
| Quiz questions | Question bank matched by quiz title | `questionsForQuiz` in `src/data/sampleData.js` |

## Structure

```
src/
  api/          client.js (fetch + JWT), endpoints.js, jsRunner.js
  context/      AuthContext.jsx
  components/   Layout.jsx, ui.jsx
  data/         sampleData.js, progress.js, useStudentData.js
  pages/        AuthPages, Dashboard, Practice, ProblemWorkspace, Quizzes, QuizTake, Drives
```
