// Small shared UI building blocks: Loader, Alert, Badge, StatCard, PageHeader, EmptyState.
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { Squiggle } from './Doodles';

export function Loader({ label = 'Loading…', full = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-slate-500 ${full ? 'min-h-screen' : 'py-16'}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-cream-300 border-t-ink" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

const ALERT_STYLES = {
  error: { cls: 'bg-red-50 border-red-200 text-red-800', Icon: AlertCircle },
  success: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', Icon: CheckCircle2 },
  info: { cls: 'bg-cream-50 border-cream-300 text-slate-700', Icon: Info },
  warning: { cls: 'bg-brand-50 border-brand-200 text-brand-900', Icon: AlertCircle },
};

export function Alert({ type = 'info', children, onClose }) {
  const { cls, Icon } = ALERT_STYLES[type];
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${cls}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

const BADGE_STYLES = {
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  amber: 'bg-brand-100 text-brand-800 ring-1 ring-brand-200',
  blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  gray: 'bg-cream-100 text-slate-600 ring-1 ring-cream-300',
  brand: 'bg-white text-ink ring-1 ring-cream-300',
};

export function Badge({ color = 'gray', children }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_STYLES[color]}`}>{children}</span>;
}

export const difficultyColor = (d) => ({ EASY: 'green', MEDIUM: 'amber', HARD: 'red' }[d] || 'gray');

export const statusColor = (s) => ({
  PENDING: 'amber', SHORTLISTED: 'blue', INTERVIEW_SCHEDULED: 'brand', REJECTED: 'red', SELECTED: 'green',
}[s] || 'gray');

export function StatCard({ icon: Icon, label, value, hint, accent = 'bg-brand-100 text-brand-800' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-xl p-2.5 ${accent}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-slate-600">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <Squiggle className="mb-4 w-16 opacity-60" />
      <p className="font-semibold text-ink">{title}</p>
      {children && <div className="mt-1 text-sm text-slate-500">{children}</div>}
    </div>
  );
}

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
