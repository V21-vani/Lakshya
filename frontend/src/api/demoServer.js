// In-browser stand-in for the Spring Boot API, used only in demo builds
// (VITE_DEMO=true, e.g. the GitHub Pages site) where no backend is running.
// It answers the same routes with the same JSON shapes, and keeps its data in
// this browser's localStorage, so every visitor gets their own copy.

const DB_KEY = 'lakshya_demo_db';
const PASSWORD = 'password123';

const now = () => new Date().toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();
const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString();
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

function user(id, username, role, extra = {}) {
  return {
    id, username, email: `${username}@lakshya.edu`, role, password: PASSWORD,
    profileImageUrl: null, phoneNumber: null, profileCompleted: role !== 'STUDENT', active: true, ...extra,
  };
}

// Mirrors backend/src/main/java/.../seed/SeedDataLoader.java, plus a few extra
// students and some activity so both dashboards have something to show.
function seed() {
  const users = [
    user(1, 'admin', 'ADMIN'),
    user(2, 'mentor1', 'MENTOR'),
    user(3, 'student1', 'STUDENT'),
    user(4, 'priya', 'STUDENT'),
    user(5, 'rahul', 'STUDENT'),
  ];
  const problems = [
    {
      id: 1, title: 'Two Sum Problem', description: 'Given an array, find two numbers that add up to target',
      difficulty: 'EASY', topic: 'ARRAYS', inputFormat: null, outputFormat: null, constraints: null,
      timeLimit: 2, memoryLimit: 256, active: true, createdAt: daysAgo(20), createdById: 1,
      testCasesJson: '{"testCases": [{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}]}',
    },
    {
      id: 2, title: 'Fibonacci Sequence', description: 'Calculate nth Fibonacci number',
      difficulty: 'EASY', topic: 'MATH', inputFormat: null, outputFormat: null, constraints: null,
      timeLimit: 2, memoryLimit: 256, active: true, createdAt: daysAgo(20), createdById: 1,
      testCasesJson: '{"testCases": [{"input": {"n": 10}, "output": 55}]}',
    },
  ];
  const quizzes = [
    {
      id: 1, title: 'Java Fundamentals', description: 'OOP, collections and exceptions basics.',
      durationMinutes: 20, totalQuestions: 10, passingScore: 60, active: true, createdAt: daysAgo(20), createdById: 1,
    },
  ];
  const drives = [
    {
      id: 1, companyName: 'Acme Technologies', jobTitle: 'Software Engineer Intern',
      jobDescription: 'Summer internship for final-year students.', requiredTechStacks: '["Java", "Spring Boot", "SQL"]',
      minimumScore: 60, applicationDeadline: inDays(30), createdAt: daysAgo(20), createdById: 1, active: true,
    },
  ];
  const attempt = (id, studentId, score, d) => ({
    id, attemptId: uuid(), studentId, quizId: 1, scoreObtained: score, maxScore: 10, timeTakenMinutes: 12,
    answersJson: JSON.stringify({ total: 10 }), status: 'COMPLETED', startedAt: daysAgo(d), completedAt: daysAgo(d),
  });
  const attempts = [attempt(1, 3, 8, 6), attempt(2, 3, 9, 2), attempt(3, 4, 7, 4), attempt(4, 5, 4, 3)];
  const applications = [
    { id: 1, applicationId: uuid(), studentId: 4, driveId: 1, status: 'SHORTLISTED', appliedAt: daysAgo(3) },
    { id: 2, applicationId: uuid(), studentId: 5, driveId: 1, status: 'PENDING', appliedAt: daysAgo(1) },
  ];
  return { users, problems, quizzes, drives, attempts, applications };
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return seed();
}

function save(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* storage unavailable */ }
}

/** Clears this browser's demo data back to the seed. */
export function resetDemoData() {
  try { localStorage.removeItem(DB_KEY); } catch { /* storage unavailable */ }
}

// ---- Shaping records the way the real API returns them ----
const publicUser = (db, id) => {
  const u = db.users.find((x) => x.id === id);
  if (!u) return null;
  const { password: _pw, ...rest } = u;
  return rest;
};
const withCreator = (db, { createdById, ...rest }) => ({ ...rest, createdBy: publicUser(db, createdById) });
const shapeAttempt = (db, { studentId, quizId, ...rest }) => ({
  ...rest,
  student: publicUser(db, studentId),
  quiz: withCreator(db, db.quizzes.find((q) => q.id === quizId)),
});
const shapeApplication = (db, { studentId, driveId, ...rest }) => ({
  ...rest,
  student: publicUser(db, studentId),
  placementDrive: withCreator(db, db.drives.find((d) => d.id === driveId)),
});

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const nextId = (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

function currentUser(db, token) {
  const id = Number(String(token || '').replace('demo.', ''));
  const u = db.users.find((x) => x.id === id);
  if (!u) throw new HttpError(401, 'Please log in again.');
  return u;
}
const isStaff = (u) => u.role === 'MENTOR' || u.role === 'ADMIN';
function requireStaff(u) {
  if (!isStaff(u)) throw new HttpError(403, 'Only mentors can do this');
}
function requireSelfOrStaff(u, studentId) {
  if (!isStaff(u) && u.id !== studentId) throw new HttpError(403, 'You can only view your own data');
}

// Each route: [method, pattern, handler(ctx)] where ctx = { db, params, query, body, me() }.
const routes = [
  ['POST', '/api/auth/login', ({ db, body }) => {
    const u = db.users.find((x) => x.username === body?.username);
    if (!u || u.password !== body?.password) throw new HttpError(401, 'Invalid username or password');
    return { token: `demo.${u.id}`, tokenType: 'Bearer', user: publicUser(db, u.id) };
  }],
  ['POST', '/api/auth/signup', ({ db, body = {} }) => {
    const { username, email, password, role = 'STUDENT' } = body;
    if (!username || !email || !password) throw new HttpError(400, 'Username, email and password are required');
    if (password.length < 6) throw new HttpError(400, 'password: size must be between 6 and 2147483647');
    if (db.users.some((x) => x.username === username)) throw new HttpError(400, 'Username already exists');
    if (db.users.some((x) => x.email === email)) throw new HttpError(400, 'Email already exists');
    const r = String(role).toUpperCase();
    if (r !== 'STUDENT' && r !== 'MENTOR') throw new HttpError(400, 'Role must be STUDENT or MENTOR');
    const u = user(nextId(db.users), username, r, { email, password, profileCompleted: false });
    db.users.push(u);
    return [201, publicUser(db, u.id)];
  }],
  ['GET', '/api/auth/me', ({ db, me }) => publicUser(db, me().id)],
  ['POST', '/api/auth/logout', () => ({ message: 'Logged out' })],

  ['GET', '/api/problems', ({ db, query }) => db.problems
    .filter((p) => p.active && (!query.topic || p.topic === query.topic))
    .map((p) => withCreator(db, p))],
  ['GET', '/api/problems/:id', ({ db, params }) => {
    const p = db.problems.find((x) => x.id === params.id);
    if (!p) throw new HttpError(404, 'Problem not found');
    return withCreator(db, p);
  }],
  ['POST', '/api/problems', ({ db, body = {}, me }) => {
    const u = me(); requireStaff(u);
    if (!body.title) throw new HttpError(400, 'title: is required');
    if (!body.difficulty) throw new HttpError(400, 'difficulty: is required');
    const p = {
      inputFormat: null, outputFormat: null, constraints: null, timeLimit: 2, memoryLimit: 256, testCasesJson: null,
      ...body, id: nextId(db.problems), active: true, createdAt: now(), createdById: u.id,
    };
    db.problems.push(p);
    return [201, withCreator(db, p)];
  }],

  ['GET', '/api/quizzes', ({ db }) => db.quizzes.filter((q) => q.active).map((q) => withCreator(db, q))],
  ['GET', '/api/quizzes/student/:id/attempts', ({ db, params, me }) => {
    requireSelfOrStaff(me(), params.id);
    return db.attempts.filter((a) => a.studentId === params.id).map((a) => shapeAttempt(db, a));
  }],
  ['GET', '/api/quizzes/:id/attempts', ({ db, params, me }) => {
    requireStaff(me());
    return db.attempts.filter((a) => a.quizId === params.id).map((a) => shapeAttempt(db, a));
  }],
  ['GET', '/api/quizzes/:id', ({ db, params }) => {
    const q = db.quizzes.find((x) => x.id === params.id);
    if (!q) throw new HttpError(404, 'Quiz not found');
    return withCreator(db, q);
  }],
  ['POST', '/api/quizzes/:id/attempt', ({ db, params, query, me }) => {
    const u = me();
    const q = db.quizzes.find((x) => x.id === params.id);
    if (!q) throw new HttpError(404, 'Quiz not found');
    for (const k of ['scoreObtained', 'timeTakenMinutes', 'answersJson']) {
      if (query[k] === undefined) throw new HttpError(400, `Missing parameter '${k}'`);
    }
    const a = {
      id: nextId(db.attempts), attemptId: uuid(), studentId: u.id, quizId: q.id,
      scoreObtained: Number(query.scoreObtained), maxScore: q.totalQuestions ?? q.passingScore,
      timeTakenMinutes: Number(query.timeTakenMinutes), answersJson: query.answersJson,
      status: 'COMPLETED', startedAt: now(), completedAt: now(),
    };
    db.attempts.push(a);
    return [201, shapeAttempt(db, a)];
  }],
  ['POST', '/api/quizzes', ({ db, body = {}, me }) => {
    const u = me(); requireStaff(u);
    const q = { ...body, id: nextId(db.quizzes), active: true, createdAt: now(), createdById: u.id };
    db.quizzes.push(q);
    return [201, withCreator(db, q)];
  }],

  ['POST', '/api/applications', ({ db, body = {}, me }) => {
    const u = me();
    const driveId = body.placementDrive?.id;
    if (!driveId) throw new HttpError(400, 'placementDrive.id is required');
    if (!db.drives.some((d) => d.id === driveId)) throw new HttpError(404, 'Placement drive not found');
    const a = { id: nextId(db.applications), applicationId: uuid(), studentId: u.id, driveId, status: 'PENDING', appliedAt: now() };
    db.applications.push(a);
    return [201, shapeApplication(db, a)];
  }],
  ['GET', '/api/applications/student/:id', ({ db, params, me }) => {
    requireSelfOrStaff(me(), params.id);
    return db.applications.filter((a) => a.studentId === params.id).map((a) => shapeApplication(db, a));
  }],
  ['GET', '/api/applications/drive/:id', ({ db, params, me }) => {
    requireStaff(me());
    return db.applications.filter((a) => a.driveId === params.id).map((a) => shapeApplication(db, a));
  }],
  ['PATCH', '/api/applications/:id/status', ({ db, params, query, me }) => {
    requireStaff(me());
    const a = db.applications.find((x) => x.id === params.id);
    if (!a) throw new HttpError(404, 'Application not found');
    a.status = query.status;
    return shapeApplication(db, a);
  }],
  // No /api/drives route, same as the real backend: the app falls back to sample drives.
];

function match(pattern, path) {
  const p = pattern.split('/');
  const s = path.split('/');
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i += 1) {
    if (p[i].startsWith(':')) {
      const n = Number(s[i]);
      if (!Number.isInteger(n)) return null;
      params[p[i].slice(1)] = n;
    } else if (p[i] !== s[i]) {
      return null;
    }
  }
  return params;
}

/** Handles one request and returns a real Response, so the caller treats it like fetch(). */
export async function handleDemoRequest(url, { method = 'GET', headers = {}, body } = {}) {
  await new Promise((r) => setTimeout(r, 120)); // feel like a network call
  const { pathname, searchParams } = new URL(url);
  const path = pathname.slice(pathname.indexOf('/api/'));
  const db = load();
  const json = (status, data) => new Response(data === undefined ? '' : JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });

  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const params = match(pattern, path);
    if (!params) continue;
    try {
      const token = (headers.Authorization || '').replace('Bearer ', '');
      const result = handler({
        db, params, query: Object.fromEntries(searchParams), body: body ? JSON.parse(body) : undefined,
        me: () => currentUser(db, token),
      });
      if (method !== 'GET') save(db);
      return Array.isArray(result) && typeof result[0] === 'number' && result.length === 2
        ? json(result[0], result[1])
        : json(200, result);
    } catch (e) {
      if (e instanceof HttpError) return json(e.status, { error: e.message });
      return json(500, { error: 'Something went wrong' });
    }
  }
  return json(404, { error: 'Not found' });
}
