import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui';
import { DoodleLeft, DoodleRight, Squiggle } from '../components/Doodles';
import Logo from '../components/Logo';

function AuthShell({ mode, title, subtitle, children }) {
  const other = mode === 'login'
    ? { to: '/signup', cta: 'Create account' }
    : { to: '/login', cta: 'Log in' };
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-cream-100">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <div>
          <Logo />
          <p className="mt-1 hidden text-xs text-slate-500 sm:block">Placement Mentoring Platform</p>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link to={other.to} className="btn-primary">{other.cta}</Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-4xl bg-white p-7 shadow-float sm:p-10">
          <div className="mb-7 text-center">
            <h1 className="text-[28px] font-bold tracking-tight text-ink">{title}</h1>
            <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-slate-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>

      <footer className="relative z-10 pb-6 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} Lakshya <span className="mx-2">|</span> Placement Mentoring
      </footer>

      {/* Decorative illustrations */}
      <Squiggle className="pointer-events-none absolute left-[38%] top-24 hidden w-24 lg:block" />
      <Squiggle className="pointer-events-none absolute right-[34%] top-40 hidden w-16 lg:block" />
      <DoodleLeft className="pointer-events-none absolute bottom-16 left-[3%] hidden w-[300px] lg:block xl:left-[7%]" />
      <DoodleRight className="pointer-events-none absolute bottom-16 right-[3%] hidden w-[300px] lg:block xl:right-[7%]" />
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, minLength, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">Password</label>
      <input id={id} type={visible ? 'text' : 'password'} className="input pr-16" placeholder={placeholder}
        autoComplete={autoComplete} minLength={minLength} required value={value} onChange={onChange} />
      <button type="button" onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-cream-100 hover:text-ink"
        aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? 'Hide' : 'Show'}
      </button>
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

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.username, form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell mode="login" title="Student Login" subtitle="Hey, enter your details to sign in to your account">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="sr-only" htmlFor="username">Username</label>
          <input id="username" className="input" placeholder="Enter your username" autoComplete="username" required
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <PasswordInput id="password" placeholder="Password" autoComplete="current-password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <p className="text-sm text-slate-600">Trouble signing in? Ask your placement mentor to reset your account.</p>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="pt-2 text-center text-sm text-slate-600">
          Don&apos;t have an account? <Link to="/signup" className="link">Sign up now</Link>
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

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell mode="signup" title="Create Account" subtitle="Join Lakshya and start preparing for your placements">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="sr-only" htmlFor="su-username">Username</label>
          <input id="su-username" className="input" placeholder="Choose a username" autoComplete="username" required value={form.username} onChange={set('username')} />
        </div>
        <div>
          <label className="sr-only" htmlFor="su-email">Email</label>
          <input id="su-email" type="email" className="input" placeholder="Email address" autoComplete="email" required value={form.email} onChange={set('email')} />
        </div>
        <PasswordInput id="su-password" placeholder="Password (min. 6 characters)" autoComplete="new-password" minLength={6}
          value={form.password} onChange={set('password')} />
        <fieldset>
          <legend className="mb-2 text-sm text-slate-600">I am joining as a</legend>
          <div className="grid grid-cols-2 gap-2">
            {[['STUDENT', 'Student'], ['MENTOR', 'Mentor']].map(([value, label]) => (
              <label key={value}
                className={`cursor-pointer rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition ${
                  form.role === value ? 'border-ink bg-ink text-white' : 'border-cream-300 bg-white text-ink hover:bg-cream-50'}`}>
                <input type="radio" name="role" value={value} className="sr-only" checked={form.role === value} onChange={set('role')} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="pt-2 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="link">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
