import { Suspense, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, ClipboardCheck, Code2, LayoutDashboard, Library, ListChecks, LogOut, Menu, Users, X } from 'lucide-react';
import { isStaff } from '../roles';
import { useAuth } from '../context/AuthContext';
import { Loader } from './ui';
import Logo from './Logo';
import { Squiggle } from './Doodles';

const MENTOR_NAV = [
  { to: '/mentor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/mentor/students', label: 'Students', icon: Users },
  { to: '/mentor/content', label: 'Problems & Quizzes', icon: Library },
  { to: '/mentor/applications', label: 'Applications', icon: ClipboardCheck },
];

const STUDENT_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/practice', label: 'Practice', icon: Code2 },
  { to: '/quizzes', label: 'Quizzes', icon: ListChecks },
  { to: '/drives', label: 'Placement Drives', icon: Briefcase },
];

function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const staff = isStaff(user);
  const nav = staff ? MENTOR_NAV : STUDENT_NAV;
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-cream-100 transition-transform lg:translate-x-0 ${open ? 'translate-x-0 shadow-float' : '-translate-x-full'}`}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Logo />
          <button className="rounded-lg p-1 hover:bg-cream-200 lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-2">
          <p className="px-3.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{staff ? 'Mentor portal' : 'Student portal'}</p>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-ink shadow-soft' : 'text-slate-600 hover:bg-cream-200/60 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`rounded-lg p-1.5 ${isActive ? 'bg-brand-300 text-ink' : ''}`}><Icon className="h-4 w-4" /></span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="m-4 rounded-2xl border border-dashed border-cream-300 p-4">
          <Squiggle className="w-14" />
          <p className="mt-2 text-sm font-semibold text-ink">{staff ? 'Students first' : 'Keep the streak going'}</p>
          <p className="mt-0.5 text-xs text-slate-500">{staff ? 'Check in on students below the passing mark.' : 'A quiz a day builds your readiness score.'}</p>
        </div>
      </aside>
    </>
  );
}

function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.username || '?').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between bg-cream-100/85 px-4 backdrop-blur sm:px-8">
      <button className="rounded-lg p-1 hover:bg-cream-200 lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3 rounded-2xl bg-white py-1.5 pl-1.5 pr-2 shadow-soft">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-300 text-sm font-bold text-ink">{initials}</span>
        <div className="pr-1">
          <p className="text-sm font-semibold leading-tight text-ink">{user?.username}</p>
          <p className="text-xs capitalize leading-tight text-slate-500">{user?.role?.toLowerCase()}</p>
        </div>
        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-cream-100 hover:text-ink"
          onClick={() => { logout(); navigate('/login'); }}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-cream-100">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Navbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-8">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
