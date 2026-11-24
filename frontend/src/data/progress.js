// Per-user progress kept in the browser until the backend stores code submissions.
// Wrapped in try/catch because storage can be unavailable (private windows, blocked cookies).

const key = (userId) => `lakshya_progress_${userId}`;

function read(userId) {
  try {
    return JSON.parse(localStorage.getItem(key(userId))) || { solved: {}, sampleApplications: {} };
  } catch {
    return { solved: {}, sampleApplications: {} };
  }
}

function write(userId, data) {
  try { localStorage.setItem(key(userId), JSON.stringify(data)); } catch { /* ignore */ }
}

export const progress = {
  get: read,
  markSolved(userId, problem, language) {
    const data = read(userId);
    if (!data.solved[problem.id]) {
      data.solved[problem.id] = {
        id: problem.id, title: problem.title, topic: problem.topic,
        difficulty: problem.difficulty, language, solvedAt: new Date().toISOString(),
      };
      write(userId, data);
    }
  },
  applySample(userId, drive) {
    const data = read(userId);
    data.sampleApplications[drive.id] = {
      id: `sample-${drive.id}`, status: 'PENDING', appliedAt: new Date().toISOString(),
      placementDrive: drive, sample: true,
    };
    write(userId, data);
  },
};
