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
