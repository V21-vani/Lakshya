import { Fragment, useState } from 'react';
import { Search } from 'lucide-react';
import { ATTENTION_THRESHOLD, useMentorData } from '../../data/useMentorData';
import { Alert, Badge, EmptyState, Loader, PageHeader, formatDateTime, statusColor } from '../../components/ui';

function Readiness({ value }) {
  if (value === null) return <span className="text-xs text-slate-400">Not rated</span>;
  const color = value >= 80 ? 'bg-[#8FBF8A]' : value >= ATTENTION_THRESHOLD ? 'bg-brand-400' : 'bg-[#E07A5F]';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-cream-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-semibold text-ink">{value}%</span>
    </div>
  );
}

export default function MentorStudentsPage() {
  const d = useMentorData();
  const [query, setQuery] = useState('');
  const [onlyAttention, setOnlyAttention] = useState(false);
  const [open, setOpen] = useState(null);

  if (d.loading) return <Loader label="Loading students…" />;

  const visible = d.students.filter((s) =>
    (s.username + s.email).toLowerCase().includes(query.toLowerCase()) &&
    (!onlyAttention || (s.readiness !== null && s.readiness < ATTENTION_THRESHOLD)));

  return (
    <div>
      <PageHeader title="Students" subtitle="Readiness, quiz history and applications for each student." />
      {d.error && <div className="mb-4"><Alert type="error">{d.error}</Alert></div>}

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search students" />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-ink" checked={onlyAttention} onChange={(e) => setOnlyAttention(e.target.checked)} />
          Needs attention only
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No students to show">Students appear here once they take a quiz or apply to a drive.</EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-cream-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Student</th><th className="px-5 py-3">Readiness</th><th className="px-5 py-3">Quizzes</th>
                <th className="px-5 py-3">Applications</th><th className="px-5 py-3">Last active</th><th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {visible.map((s) => (
                <Fragment key={s.id}>
                  <tr className="hover:bg-cream-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-xs font-bold text-ink">{s.username.slice(0, 2).toUpperCase()}</span>
                        <div>
                          <p className="font-semibold text-ink">{s.username}</p>
                          <p className="text-xs text-slate-500">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Readiness value={s.readiness} /></td>
                    <td className="px-5 py-3 text-slate-700">{s.attempts.length}{s.best !== null && <span className="text-xs text-slate-400"> · best {s.best}%</span>}</td>
                    <td className="px-5 py-3 text-slate-700">{s.applications.length}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDateTime(s.lastActive)}</td>
                    <td className="px-5 py-3 text-right">
                      <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>
                        {open === s.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {open === s.id && (
                    <tr className="bg-cream-50">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Quiz attempts</p>
                            {s.attempts.length ? s.attempts.map((a) => (
                              <div key={a.id} className="flex items-center justify-between py-1 text-sm">
                                <span>{a.quiz?.title} <span className="text-xs text-slate-400">· {formatDateTime(a.completedAt)}</span></span>
                                <Badge color={a.percent >= (a.quiz?.passingScore ?? 0) ? 'green' : 'red'}>{a.percent}%</Badge>
                              </div>
                            )) : <p className="text-sm text-slate-400">None</p>}
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Applications</p>
                            {s.applications.length ? s.applications.map((a) => (
                              <div key={a.id} className="flex items-center justify-between py-1 text-sm">
                                <span>{a.placementDrive?.companyName}</span>
                                <Badge color={statusColor(a.status)}>{a.status}</Badge>
                              </div>
                            )) : <p className="text-sm text-slate-400">None</p>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
