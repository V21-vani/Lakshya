import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarClock, CheckCircle2, Target, XCircle } from 'lucide-react';
import { applicationsApi, drivesApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { progress } from '../data/progress';
import { useStudentData } from '../data/useStudentData';
import { Alert, Badge, EmptyState, Loader, PageHeader, formatDate, statusColor } from '../components/ui';

const parseStack = (s) => {
  try { return JSON.parse(s || '[]'); } catch { return s ? s.split(',').map((x) => x.trim()) : []; }
};

/** Eligibility rule: average quiz score must meet the drive's minimum score, and the deadline must not have passed. */
export function eligibility(drive, readinessScore) {
  const closed = drive.applicationDeadline && new Date(drive.applicationDeadline) < new Date();
  if (closed) return { eligible: false, closed: true, reason: 'Applications closed' };
  const min = drive.minimumScore ?? 0;
  if (readinessScore === null) {
    return min > 0
      ? { eligible: false, reason: `Take a quiz first. Requires ${min}% readiness score` }
      : { eligible: true, reason: 'No minimum score' };
  }
  return readinessScore >= min
    ? { eligible: true, reason: `Your score ${readinessScore}% meets the ${min}% minimum` }
    : { eligible: false, reason: `Requires ${min}%, your score is ${readinessScore}%` };
}

function ConfirmDialog({ drive, onCancel, onConfirm, busy }) {
  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-slate-900/40 px-4" role="dialog" aria-modal="true" aria-labelledby="apply-title">
      <div className="card w-full max-w-md p-6">
        <h2 id="apply-title" className="text-lg font-semibold text-ink">Apply to {drive.companyName}?</h2>
        <p className="mt-2 text-sm text-slate-600">
          You're applying for <b>{drive.jobTitle}</b>. Your profile and assessment scores will be shared with the placement team.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} disabled={busy}>{busy ? 'Submitting…' : 'Confirm application'}</button>
        </div>
      </div>
    </div>
  );
}

export default function DrivesPage() {
  const { user } = useAuth();
  const student = useStudentData();
  const [drives, setDrives] = useState(null);
  const [isSample, setIsSample] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    drivesApi.list()
      .then(({ drives: d, isSample: s }) => { setDrives(d); setIsSample(s); })
      .catch((e) => { setError(e.message); setDrives([]); });
  }, []);

  if (!drives || student.loading) return <Loader label="Loading placement drives…" />;

  const appliedByDrive = Object.fromEntries(student.applications.map((a) => [a.placementDrive?.id, a]));

  const rows = drives.map((d) => ({ drive: d, elig: eligibility(d, student.readinessScore), application: appliedByDrive[d.id] }));
  const visible = rows.filter(({ elig, application }) =>
    filter === 'ALL' || (filter === 'ELIGIBLE' && elig.eligible) || (filter === 'APPLIED' && application));

  const apply = async () => {
    const drive = confirming;
    setBusy(true);
    setError('');
    try {
      if (drive.sample) {
        progress.applySample(user.id, drive);
      } else {
        await applicationsApi.apply(drive.id);
      }
      setSuccess(`Application submitted to ${drive.companyName}.`);
      await student.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Placement Drives" subtitle="Companies hiring now, and whether you're eligible to apply." />

      {isSample && (
        <Alert type="warning">
          Showing sample drives because the backend doesn't list drives yet. Only <b>Acme Technologies</b> is a real drive; applications to the others are saved in this browser only.
        </Alert>
      )}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-brand-200 p-2 text-ink"><Target className="h-5 w-5" /></span>
          <div>
            <p className="text-xs text-slate-500">Your readiness score</p>
            <p className="text-lg font-semibold text-ink">
              {student.readinessScore === null ? 'Not yet rated' : `${student.readinessScore}%`}
            </p>
          </div>
          {student.readinessScore === null && <Link to="/quizzes" className="ml-2 text-sm font-medium link">Take a quiz →</Link>}
        </div>
        <div className="flex gap-1 rounded-xl border border-cream-200 bg-cream-50 p-1 text-sm font-semibold" role="tablist">
          {[['ALL', 'All'], ['ELIGIBLE', 'Eligible'], ['APPLIED', 'Applied']].map(([k, label]) => (
            <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
              className={`rounded-lg px-3.5 py-1.5 ${filter === k ? 'bg-ink text-white' : 'text-slate-600 hover:bg-cream-100'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No drives here">Try a different filter.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map(({ drive, elig, application }) => (
            <div key={drive.id} className="card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-sunny/50 p-2.5 text-ink"><Building2 className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-ink">{drive.companyName}</h2>
                  <p className="text-sm text-slate-600">{drive.jobTitle}</p>
                </div>
                {elig.closed ? <Badge color="gray">Closed</Badge>
                  : elig.eligible ? <Badge color="green"><CheckCircle2 className="h-3 w-3" />Eligible</Badge>
                    : <Badge color="red"><XCircle className="h-3 w-3" />Not Eligible</Badge>}
              </div>

              <p className="mt-3 flex-1 text-sm text-slate-500">{drive.jobDescription}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {parseStack(drive.requiredTechStacks).map((t) => <Badge key={t} color="brand">{t}</Badge>)}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><Target className="h-3.5 w-3.5" />Min score {drive.minimumScore ?? 0}%</span>
                <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />Apply by {formatDate(drive.applicationDeadline)}</span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-cream-200 pt-4">
                <p className={`text-xs ${elig.eligible ? 'text-emerald-700' : 'text-slate-500'}`}>{elig.reason}</p>
                {application ? (
                  <Badge color={statusColor(application.status)}>Applied · {application.status}</Badge>
                ) : (
                  <button className="btn-primary shrink-0 py-1.5" disabled={!elig.eligible} onClick={() => setConfirming(drive)}>
                    Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirming && <ConfirmDialog drive={confirming} busy={busy} onCancel={() => setConfirming(null)} onConfirm={apply} />}
    </div>
  );
}
