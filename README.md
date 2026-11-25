# Lakshya
Placement mentoring and skill assessment platform.

| Folder | What it is | Port |
|---|---|---|
| `backend/` | Main Spring Boot API (auth, problems, quizzes, drives, applications) | 8080 |
| `placement-services/` | Code execution (Judge0), eligibility, email, PDF reports | 8082 |
| `frontend/` | React + Vite app (student and mentor portals) | 5173 |

## Run it

You need **Java 17** and **Node.js**. Maven is *not* needed: each Java project has a Maven wrapper (`mvnw.cmd`) that downloads it.

On Windows, double-click `run_project.bat`. It opens one window per service. The first run takes a few minutes.

Or run each part yourself:

```
cd backend             && mvnw.cmd spring-boot:run
cd placement-services  && mvnw.cmd spring-boot:run
cd frontend            && npm install && npm run dev
```

Then open http://localhost:5173. Demo logins (password `password123`): `student1`, `mentor1`, `admin`.

## Deploy

**Backend on Render** (free, runs the Spring Boot API from `backend/Dockerfile`):
Render dashboard → New → Blueprint → pick this repo. `render.yaml` sets everything up.
The free plan sleeps after 15 idle minutes, so the first request can take about a minute. The H2 database resets on each redeploy and the demo logins are re-created.

**Frontend on Vercel**: Vercel dashboard → Add New → Project → import this repo, set
*Root Directory* to `frontend`, and add the environment variable
`VITE_API_URL` = your Render URL (e.g. `https://lakshya-backend.onrender.com`). Every push to `main` redeploys.

**Demo on GitHub Pages** (no backend; data stays in the visitor's browser):
repo Settings → Pages → Source: *GitHub Actions*. The workflow in `.github/workflows/deploy-pages.yml`
publishes `https://<owner>.github.io/Lakshya/` on every push to `main`.
