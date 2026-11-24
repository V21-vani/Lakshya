import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ClipboardCheck, Library, Target, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ATTENTION_THRESHOLD, useMentorData } from '../../data/useMentorData';
import { Alert, Badge, EmptyState, Loader, StatCard, formatDateTime } from '../../components/ui';
import { DoodleLeft, Squiggle } from '../../components/Doodles';

const BUCKETS = [
  { name: '0–39', min: 0, max: 39, fill: '#E07A5F' },
  { name: '40–59', min: 40, max: 59, fill: '#FFC47E' },
  { name: '60–79', min: 60, max: 79, fill: '#FFE08A' },
  { name: '80–100', min: 80, max: 100, fill: '#8FBF8A' },
];

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-ink">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

const Empty = ({ children }) => <div className="flex h-full items-center justify-center text-sm text-slate-400">{children}</div>;

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const d = useMentorData();
  if (d.loading) return <Loader label="Loading mentor overview…" />;

  const avg = d.attempts.length ? Math.round(d.attempts.reduce((s, a) => s + a.percent, 0) / d.attempts.length) : null;
  const pending = d.applications.filter((a) => a.status === 'PENDING');
  const attention = d.students.filter((s) => s.readiness !== null && s.readiness < ATTENTION_THRESHOLD);

  const distribution = BUCKETS.map((b) => ({
    ...b, students: d.students.filter((s) => s.readiness !== null && s.readiness >= b.min && s.readiness <= b.max).length,
  }));

  const quizAverages = d.quizzes.map((q) => {
    const list = d.attempts.filter((a) => a.quiz?.id === q.id);
    return { name: q.title, avg: list.length ? Math.round(list.reduce((s, a) => s + a.percent, 0) / list.length) : 0, attempts: list.length };
  });

  const recent = [...d.attempts].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden px-6 py-7 sm:px-8">
        <div className="relative z-10 max-w-lg">
          <p className="text-sm font-medium text-slate-500">Mentor dashboard</p>
          <h1 className="mt-1 text-[30px] font-bold tracking-tight text-ink">Welcome, {user.username} 👋</h1>
          <p className="mt-2 text-[15px] text-slate-600">
            {pending.length
              ? <>You have <b>{pending.length}</b> application{pending.length > 1 ? 's' : ''} waiting for review and <b>{attention.length}</b> student{attention.length === 1 ? '' : 's'} below {ATTENTION_THRESHOLD}%.</>
              : 'No applications waiting for review. Here is how your students are doing.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/mentor/applications" className="btn-primary">Review applications</Link>
            <Link to="/mentor/content" className="btn-secondary">Add a problem or quiz</Link>
          </div>
        </div>
        <DoodleLeft className="pointer-events-none absolute -bottom-6 right-4 hidden w-56 md:block" />
        <Squiggle className="pointer-events-none absolute right-72 top-8 hidden w-20 lg:block" />
      </section>

      {d.error && <Alert type="error">{d.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active students" value={d.students.length} hint="Took a quiz or applied" />
        <StatCard icon={Target} label="Average quiz score" value={avg === null ? '—' : `${avg}%`}
          hint={`Across ${d.attempts.length} attempt${d.attempts.length === 1 ? '' : 's'}`} accent="bg-sunny/60 text-ink" />
        <StatCard icon={ClipboardCheck} label="Pending applications" value={pending.length}
          hint={`${d.applications.length} total`} accent="bg-sky-50 text-sky-800" />
        <StatCard icon={Library} label="Content library" value={d.problems.length + d.quizzes.length}
          hint={`${d.problems.length} problem${d.problems.length === 1 ? '' : 's'} · ${d.quizzes.length} quiz${d.quizzes.length === 1 ? '' : 'zes'}`} accent="bg-[#E8F0C8] text-ink" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Readiness distribution" subtitle="Students by average quiz score (%)">
          {d.students.some((s) => s.readiness !== null) ? (
            <ResponsiveContainer>
              <BarChart data={distribution} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE6D9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="students" maxBarSize={56} stroke="#1C1B19" strokeWidth={1.2} radius={[8, 8, 0, 0]}>
                  {distribution.map((b) => <Cell key={b.name} fill={b.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty>No quiz attempts yet</Empty>}
        </ChartCard>

        <ChartCard title="Quiz averages" subtitle="Average score per quiz (%)">
          {quizAverages.length ? (
            <ResponsiveContainer>
              <BarChart data={quizAverages} layout="vertical" margin={{ left: 10, right: 16, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE6D9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v, _n, p) => [`${v}% (${p.payload.attempts} attempts)`, 'Average']} />
                <Bar dataKey="avg" maxBarSize={36} fill="#FFC47E" stroke="#1C1B19" strokeWidth={1.2} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty>No quizzes yet</Empty>}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-brand-700" />
            <h2 className="font-semibold text-ink">Needs attention</h2>
          </div>
          <p className="text-xs text-slate-500">Readiness below {ATTENTION_THRESHOLD}%</p>
          {attention.length ? (
            <ul className="mt-3 divide-y divide-cream-200">
              {attention.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-xs font-bold text-ink">{s.username.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{s.username}</p>
                    <p className="truncate text-xs text-slate-500">{s.email}</p>
                  </div>
                  <Badge color="red">{s.readiness}%</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="mt-6 text-sm text-slate-500">Everyone is on track 🎉</p>}
        </div>

        <div className="card p-5 lg:col-span-3">
          <h2 className="font-semibold text-ink">Recent quiz attempts</h2>
          {recent.length ? (
            <ul className="mt-3 divide-y divide-cream-200">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <p className="flex-1 text-sm text-slate-700"><b className="text-ink">{a.student?.username}</b> took {a.quiz?.title}</p>
                  <Badge color={a.percent >= (a.quiz?.passingScore ?? 0) ? 'green' : 'red'}>{a.percent}%</Badge>
                  <time className="w-28 shrink-0 text-right text-xs text-slate-400">{formatDateTime(a.completedAt)}</time>
                </li>
              ))}
            </ul>
          ) : <div className="mt-4"><EmptyState title="No attempts yet" /></div>}
        </div>
      </div>
    </div>
  );
}
