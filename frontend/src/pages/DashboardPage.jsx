import { Link } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Briefcase, CheckCircle2, Code2, ListChecks, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentData } from '../data/useStudentData';
import { Alert, Badge, EmptyState, Loader, StatCard, formatDateTime, statusColor } from '../components/ui';
import { DoodleRight, Squiggle } from '../components/Doodles';

const STATUS_COLORS = {
  PENDING: '#FFC47E', SHORTLISTED: '#8DB8D8', INTERVIEW_SCHEDULED: '#1C1B19', REJECTED: '#E07A5F', SELECTED: '#8FBF8A',
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-ink">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

function ChartEmpty({ children }) {
  return <div className="flex h-full items-center justify-center text-sm text-slate-400">{children}</div>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { loading, error, attempts, applications, solved, readinessScore } = useStudentData();

  if (loading) return <Loader label="Loading your progress…" />;

  // Quiz score trend, oldest first.
  const trend = [...attempts]
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
    .map((a, i) => ({ name: `#${i + 1}`, quiz: a.quiz?.title ?? 'Quiz', score: a.percent }));

  // Problems solved per topic.
  const topicCounts = solved.reduce((acc, p) => ({ ...acc, [p.topic]: (acc[p.topic] || 0) + 1 }), {});
  const topics = Object.entries(topicCounts).map(([topic, count]) => ({ topic, count }));

  // Applications by status.
  const statusCounts = applications.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {});
  const statuses = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Recent activity across quizzes, problems, and applications.
  const activity = [
    ...attempts.map((a) => ({
      at: a.completedAt, icon: ListChecks, color: 'bg-sunny/60 text-ink',
      text: <>Scored <b>{a.percent}%</b> on {a.quiz?.title ?? 'a quiz'}</>,
    })),
    ...solved.map((p) => ({
      at: p.solvedAt, icon: CheckCircle2, color: 'bg-[#E8F0C8] text-ink',
      text: <>Solved <b>{p.title}</b> in {p.language}</>,
    })),
    ...applications.map((a) => ({
      at: a.appliedAt, icon: Briefcase, color: 'bg-brand-200 text-ink',
      text: <>Applied to <b>{a.placementDrive?.companyName}</b> <Badge color={statusColor(a.status)}>{a.status}</Badge></>,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);

  const best = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null;

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden px-6 py-7 sm:px-8">
        <div className="relative z-10 max-w-lg">
          <p className="text-sm font-medium text-slate-500">Student dashboard</p>
          <h1 className="mt-1 text-[30px] font-bold tracking-tight text-ink">Hi, {user.username} 👋</h1>
          <p className="mt-2 text-[15px] text-slate-600">Here&apos;s how your placement preparation is going. Keep practising to raise your readiness score.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/practice" className="btn-primary">Continue practice</Link>
            <Link to="/drives" className="btn-secondary">View placement drives</Link>
          </div>
        </div>
        <DoodleRight className="pointer-events-none absolute -bottom-6 right-4 hidden w-56 md:block" />
        <Squiggle className="pointer-events-none absolute right-72 top-8 hidden w-20 lg:block" />
      </section>

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Target} label="Readiness score" value={readinessScore === null ? '—' : `${readinessScore}%`}
          hint={readinessScore === null ? 'Take a quiz to get your score' : 'Average of your quiz scores'} />
        <StatCard icon={ListChecks} label="Quizzes taken" value={attempts.length}
          hint={best !== null ? `Best score ${best}%` : 'No attempts yet'} accent="bg-sunny/60 text-ink" />
        <StatCard icon={Code2} label="Problems solved" value={solved.length}
          hint="All test cases passed" accent="bg-[#E8F0C8] text-ink" />
        <StatCard icon={Briefcase} label="Applications" value={applications.length}
          hint={`${statusCounts.SHORTLISTED || 0} shortlisted`} accent="bg-sky-50 text-sky-800" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Quiz performance" subtitle="Score per attempt (%)">
            {trend.length ? (
              <ResponsiveContainer>
                <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFC47E" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#FFC47E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECE6D9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Score']} labelFormatter={(l, p) => p?.[0]?.payload.quiz ?? l} />
                  <Area type="monotone" dataKey="score" stroke="#1C1B19" strokeWidth={2} dot={{ r: 4, fill: "#fff", stroke: "#1C1B19", strokeWidth: 1.5 }} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <ChartEmpty>No quiz attempts yet. <Link to="/quizzes" className="ml-1 link">Take one</Link></ChartEmpty>}
          </ChartCard>
        </div>

        <ChartCard title="Applications" subtitle="By current status">
          {statuses.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statuses} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statuses.map((s) => <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#94a3b8'} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ChartEmpty>No applications yet</ChartEmpty>}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Practice by topic" subtitle="Problems solved">
          {topics.length ? (
            <ResponsiveContainer>
              <BarChart data={topics} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE6D9" vertical={false} />
                <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#FFC47E" stroke="#1C1B19" strokeWidth={1.2} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <ChartEmpty>No problems solved yet. <Link to="/practice" className="ml-1 link">Practice</Link></ChartEmpty>}
        </ChartCard>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <h2 className="font-semibold text-ink">Recent activity</h2>
          </div>
          {activity.length ? (
            <ul className="mt-4 divide-y divide-cream-200">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className={`rounded-xl p-2 ${a.color}`}><a.icon className="h-4 w-4" /></span>
                  <p className="flex-1 text-sm text-slate-700">{a.text}</p>
                  <time className="shrink-0 text-xs text-slate-400">{formatDateTime(a.at)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4"><EmptyState title="Nothing here yet">Your quizzes, solved problems and applications will show up here.</EmptyState></div>
          )}
        </div>
      </div>
    </div>
  );
}
