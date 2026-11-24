import { request, ApiError } from './client';
import { SAMPLE_DRIVES } from '../data/sampleData';

// ---- Auth ----
export const authApi = {
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password }, auth: false }),
  signup: (data) => request('/api/auth/signup', { method: 'POST', body: data, auth: false }),
  me: () => request('/api/auth/me'),
};

// ---- Coding problems ----
export const problemsApi = {
  list: (topic) => request('/api/problems', { params: { topic } }),
  get: (id) => request(`/api/problems/${id}`),
  create: (problem) => request('/api/problems', { method: 'POST', body: problem }),
};

// ---- Quizzes ----
export const quizzesApi = {
  list: () => request('/api/quizzes'),
  get: (id) => request(`/api/quizzes/${id}`),
  submitAttempt: (quizId, { scoreObtained, timeTakenMinutes, answersJson }) =>
    request(`/api/quizzes/${quizId}/attempt`, {
      method: 'POST',
      params: { scoreObtained, timeTakenMinutes, answersJson },
    }),
  attemptsByStudent: (studentId) => request(`/api/quizzes/student/${studentId}/attempts`),
  attemptsByQuiz: (quizId) => request(`/api/quizzes/${quizId}/attempts`),
  create: (quiz) => request('/api/quizzes', { method: 'POST', body: quiz }),
};

// ---- Applications ----
export const applicationsApi = {
  apply: (driveId) => request('/api/applications', { method: 'POST', body: { placementDrive: { id: driveId } } }),
  byStudent: (studentId) => request(`/api/applications/student/${studentId}`),
  byDrive: (driveId) => request(`/api/applications/drive/${driveId}`),
  updateStatus: (id, status) => request(`/api/applications/${id}/status`, { method: 'PATCH', params: { status } }),
};

// ---- Placement drives ----
// The backend does not expose a drive-listing endpoint yet. We try it first and
// fall back to sample data, so this page keeps working until it lands.
export const DRIVES_ENDPOINT = '/api/drives';

export const drivesApi = {
  async list() {
    try {
      const drives = await request(DRIVES_ENDPOINT);
      return { drives, isSample: false };
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 401 || e.status === 403 || e.status === 405)) {
        return { drives: SAMPLE_DRIVES, isSample: true };
      }
      throw e;
    }
  },
};
