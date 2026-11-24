import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui';

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">L</span>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.username, form.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your placement prep">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input id="username" className="input" autoComplete="username" required
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" autoComplete="current-password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="text-center text-sm text-slate-500">
          New here? <Link to="/signup" className="font-medium text-brand-600 hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function SignupPage() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start practising for placements">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="label" htmlFor="su-username">Username</label>
          <input id="su-username" className="input" autoComplete="username" required value={form.username} onChange={set('username')} />
        </div>
        <div>
          <label className="label" htmlFor="su-email">Email</label>
          <input id="su-email" type="email" className="input" autoComplete="email" required value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label" htmlFor="su-password">Password</label>
          <input id="su-password" type="password" className="input" autoComplete="new-password" minLength={6} required value={form.password} onChange={set('password')} />
          <p className="mt-1 text-xs text-slate-500">At least 6 characters.</p>
        </div>
        <div>
          <label className="label" htmlFor="su-role">I am a</label>
          <select id="su-role" className="input" value={form.role} onChange={set('role')}>
            <option value="STUDENT">Student</option>
            <option value="MENTOR">Mentor</option>
          </select>
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account…' : 'Sign up'}</button>
        <p className="text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
