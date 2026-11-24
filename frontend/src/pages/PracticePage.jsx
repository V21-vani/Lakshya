import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search } from 'lucide-react';
import { problemsApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { progress } from '../data/progress';
import { Alert, Badge, EmptyState, Loader, PageHeader, difficultyColor } from '../components/ui';

export default function PracticePage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [topic, setTopic] = useState('ALL');

  useEffect(() => {
    problemsApi.list().then(setProblems).catch((e) => { setError(e.message); setProblems([]); });
  }, []);

  const solved = progress.get(user.id).solved;
  const topics = useMemo(() => [...new Set((problems || []).map((p) => p.topic))].sort(), [problems]);

  if (!problems) return <Loader label="Loading problems…" />;

  const filtered = problems.filter((p) =>
    (difficulty === 'ALL' || p.difficulty === difficulty) &&
    (topic === 'ALL' || p.topic === topic) &&
    p.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Practice" subtitle={`${Object.keys(solved).length} of ${problems.length} problems solved`} />
      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="card mb-4 flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search problems" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search problems" />
        </div>
        <select className="input w-auto" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty">
          <option value="ALL">All difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select className="input w-auto" value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Topic">
          <option value="ALL">All topics</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No problems match">Try clearing the filters.</EmptyState>
      ) : (
        <div className="card divide-y divide-cream-200 overflow-hidden">
          {filtered.map((p) => (
            <Link key={p.id} to={`/practice/${p.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-cream-100">
              <span className="w-5">{solved[p.id] && <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Solved" />}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{p.title}</p>
                <p className="truncate text-sm text-slate-500">{p.description}</p>
              </div>
              <Badge color="gray">{p.topic}</Badge>
              <Badge color={difficultyColor(p.difficulty)}>{p.difficulty}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
