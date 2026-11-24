import { useState } from 'react';
import { applicationsApi } from '../../api/endpoints';
import { useMentorData } from '../../data/useMentorData';
import { Alert, Badge, EmptyState, Loader, PageHeader, formatDateTime, statusColor } from '../../components/ui';

const STATUSES = ['PENDING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'SELECTED'];
const label = (s) => s.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function MentorApplicationsPage() {
  const d = useMentorData();
  const [filter, setFilter] = useState('ALL');
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');
  const [overrides, setOverrides] = useState({});

  if (d.loading) return <Loader label="Loading applications…" />;

  const apps = d.applications.map((a) => ({ ...a, status: overrides[a.id] ?? a.status }));
  const counts = apps.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {});
  const visible = apps
    .filter((a) => filter === 'ALL' || a.status === filter)
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  const readinessOf = (studentId) => d.students.find((s) => s.id === studentId)?.readiness ?? null;

  const change = async (app, status) => {
    setSaving(app.id);
    setError('');
    try {
      await applicationsApi.updateStatus(app.id, status);
      setOverrides((o) => ({ ...o, [app.id]: status }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Applications" subtitle="Review student applications and move them through the hiring stages." />
      {d.drivesAreSample && <Alert type="warning">Only applications to real drives are listed. The backend doesn&apos;t list drives yet, so this uses the seeded drive.</Alert>}
      {(d.error || error) && <Alert type="error" onClose={() => setError('')}>{d.error || error}</Alert>}

      <div className="flex flex-wrap gap-2" role="tablist">
        {['ALL', ...STATUSES].map((s) => (
          <button key={s} role="tab" aria-selected={filter === s} onClick={() => setFilter(s)}
            className={`chip ${filter === s ? 'bg-ink text-white' : 'bg-white text-slate-600 ring-1 ring-cream-300 hover:bg-cream-50'}`}>
            {s === 'ALL' ? 'All' : label(s)} <span className="ml-1 opacity-60">{s === 'ALL' ? apps.length : counts[s] || 0}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? <EmptyState title="No applications here" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-cream-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Student</th><th className="px-5 py-3">Drive</th><th className="px-5 py-3">Readiness</th>
                <th className="px-5 py-3">Applied</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {visible.map((a) => {
                const r = readinessOf(a.student?.id);
                const meets = r !== null && r >= (a.placementDrive?.minimumScore ?? 0);
                return (
                  <tr key={a.id} className="hover:bg-cream-50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink">{a.student?.username}</p>
                      <p className="text-xs text-slate-500">{a.student?.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{a.placementDrive?.companyName}</p>
                      <p className="text-xs text-slate-500">{a.placementDrive?.jobTitle}</p>
                    </td>
                    <td className="px-5 py-3">
                      {r === null ? <span className="text-xs text-slate-400">Not rated</span>
                        : <Badge color={meets ? 'green' : 'red'}>{r}% {meets ? '≥' : '<'} {a.placementDrive?.minimumScore ?? 0}%</Badge>}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDateTime(a.appliedAt)}</td>
                    <td className="px-5 py-3"><Badge color={statusColor(a.status)}>{label(a.status)}</Badge></td>
                    <td className="px-5 py-3">
                      <select className="input w-auto py-1.5 text-xs" value={a.status} disabled={saving === a.id}
                        onChange={(e) => change(a, e.target.value)} aria-label={`Update status for ${a.student?.username}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
