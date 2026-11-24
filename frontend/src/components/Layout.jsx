import { Suspense, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, Code2, LayoutDashboard, ListChecks, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Loader } from './ui';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/practice', label: 'Practice', icon: Code2 },
  { to: '/quizzes', label: 'Quizzes', icon: ListChecks },
  { to: '/drives', label: 'Placement Drives', icon: Briefcase },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">L</span>
            <span className="text-lg font-semibold text-slate-900">Lakshya</span>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-6 py-4 text-xs text-slate-400">Placement Mentoring Platform</p>
      </aside>
    </>
  );
}

function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.username || '?').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <button className="lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{user?.username}</p>
          <p className="text-xs capitalize text-slate-500">{user?.role?.toLowerCase()}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{initials}</span>
        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
    <div className="min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Navbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
