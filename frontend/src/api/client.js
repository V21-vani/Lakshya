// Thin fetch wrapper around the Spring Boot API.
// In dev, Vite proxies /api to http://localhost:8080 (see vite.config.js).
// Set VITE_API_URL to point at a different backend (e.g. a deployed one).

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
// VITE_DEMO=true builds a backend-free version (used for the GitHub Pages site).
export const IS_DEMO = import.meta.env.VITE_DEMO === 'true';
const TOKEN_KEY = 'lakshya_token';

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t) => {
    try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage unavailable */ }
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  },
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Fired when the server rejects our token, so AuthContext can log the user out.
export const UNAUTHORIZED_EVENT = 'lakshya:unauthorized';

export async function request(path, { method = 'GET', body, params, auth = true } = {}) {
  const url = new URL(BASE_URL + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const init = { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined };
  let res;
  try {
    if (IS_DEMO) {
      // Demo build (GitHub Pages): no backend, answer from the in-browser stand-in.
      const { handleDemoRequest } = await import('./demoServer');
      res = await handleDemoRequest(url.toString(), init);
    } else {
      res = await fetch(url, init);
    }
  } catch {
    throw new ApiError(BASE_URL
      ? 'Cannot reach the server. It may be waking up (free hosting sleeps when idle); try again in a minute.'
      : 'Cannot reach the server. Is the backend running on port 8080?', 0);
  }

  if (res.status === 401 && token) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const message = (data && data.error) || (res.status === 401 ? 'Please log in again.' : `Request failed (${res.status})`);
    throw new ApiError(message, res.status);
  }
  return data;
}
