import { useState } from 'react';
import { Clock, HelpCircle, Plus, Trophy, X } from 'lucide-react';
import { problemsApi, quizzesApi } from '../../api/endpoints';
import { useMentorData } from '../../data/useMentorData';
import { Alert, Badge, EmptyState, Loader, PageHeader, difficultyColor, formatDate } from '../../components/ui';

const EMPTY_PROBLEM = { title: '', description: '', difficulty: 'EASY', topic: '', timeLimit: 2, memoryLimit: 256, testCasesJson: '' };
const EMPTY_QUIZ = { title: '', description: '', durationMinutes: 20, totalQuestions: 10, passingScore: 60 };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-cream-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProblemForm({ onSaved, onClose }) {
  const [form, setForm] = useState(EMPTY_PROBLEM);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.testCasesJson.trim()) {
      try { JSON.parse(form.testCasesJson); } catch { setError('Test cases must be valid JSON.'); return; }
    }
    setBusy(true);
    setError('');
    try {
      await problemsApi.create({
        ...form, topic: form.topic.trim().toUpperCase(),
        timeLimit: Number(form.timeLimit), memoryLimit: Number(form.memoryLimit),
        testCasesJson: form.testCasesJson.trim() || null,
      });
      onSaved('Problem created.');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}
      <div><label className="label" htmlFor="p-title">Title</label><input id="p-title" className="input" required value={form.title} onChange={set('title')} /></div>
      <div><label className="label" htmlFor="p-desc">Description</label><textarea id="p-desc" className="input min-h-[90px]" value={form.description} onChange={set('description')} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="p-diff">Difficulty</label>
          <select id="p-diff" className="input" value={form.difficulty} onChange={set('difficulty')}>
            <option>EASY</option><option>MEDIUM</option><option>HARD</option>
          </select></div>
        <div><label className="label" htmlFor="p-topic">Topic</label><input id="p-topic" className="input" placeholder="e.g. ARRAYS" required value={form.topic} onChange={set('topic')} /></div>
        <div><label className="label" htmlFor="p-time">Time limit (s)</label><input id="p-time" type="number" min="1" className="input" value={form.timeLimit} onChange={set('timeLimit')} /></div>
        <div><label className="label" htmlFor="p-mem">Memory (MB)</label><input id="p-mem" type="number" min="16" className="input" value={form.memoryLimit} onChange={set('memoryLimit')} /></div>
      </div>
      <div>
        <label className="label" htmlFor="p-tests">Test cases (JSON)</label>
        <textarea id="p-tests" className="input min-h-[90px] font-mono text-xs" value={form.testCasesJson} onChange={set('testCasesJson')}
          placeholder={'{"testCases": [{"input": {"n": 5}, "output": 120}]}'} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Create problem'}</button>
      </div>
    </form>
  );
}

function QuizForm({ onSaved, onClose }) {
  const [form, setForm] = useState(EMPTY_QUIZ);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await quizzesApi.create({
        ...form, durationMinutes: Number(form.durationMinutes),
        totalQuestions: Number(form.totalQuestions), passingScore: Number(form.passingScore),
      });
      onSaved('Quiz created.');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}
      <div><label className="label" htmlFor="q-title">Title</label><input id="q-title" className="input" required value={form.title} onChange={set('title')} /></div>
      <div><label className="label" htmlFor="q-desc">Description</label><textarea id="q-desc" className="input min-h-[80px]" value={form.description} onChange={set('description')} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="label" htmlFor="q-dur">Minutes</label><input id="q-dur" type="number" min="1" className="input" required value={form.durationMinutes} onChange={set('durationMinutes')} /></div>
        <div><label className="label" htmlFor="q-n">Questions</label><input id="q-n" type="number" min="1" className="input" required value={form.totalQuestions} onChange={set('totalQuestions')} /></div>
        <div><label className="label" htmlFor="q-pass">Pass %</label><input id="q-pass" type="number" min="0" max="100" className="input" value={form.passingScore} onChange={set('passingScore')} /></div>
      </div>
      <Alert type="info">Questions are not stored by the backend yet, so students currently get questions from the built-in bank.</Alert>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Create quiz'}</button>
      </div>
    </form>
  );
}

export default function MentorContentPage() {
  const d = useMentorData();
  const [tab, setTab] = useState('problems');
  const [creating, setCreating] = useState(null);
  const [success, setSuccess] = useState('');

  if (d.loading) return <Loader label="Loading content…" />;

  const attemptsFor = (quizId) => d.attempts.filter((a) => a.quiz?.id === quizId);
  const saved = (msg) => { setCreating(null); setSuccess(msg); d.reload(); };

  return (
    <div className="space-y-4">
      <PageHeader title="Problems & Quizzes" subtitle="The practice content your students work through."
        actions={<button className="btn-primary" onClick={() => setCreating(tab)}><Plus className="h-4 w-4" />{tab === 'problems' ? 'New problem' : 'New quiz'}</button>} />

      {d.error && <Alert type="error">{d.error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div className="flex w-fit gap-1 rounded-xl border border-cream-200 bg-white p-1 text-sm font-semibold" role="tablist">
        {[['problems', `Problems (${d.problems.length})`], ['quizzes', `Quizzes (${d.quizzes.length})`]].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-1.5 ${tab === k ? 'bg-ink text-white' : 'text-slate-600 hover:bg-cream-100'}`}>{label}</button>
        ))}
      </div>

      {tab === 'problems' && (d.problems.length === 0 ? <EmptyState title="No problems yet" /> : (
        <div className="card divide-y divide-cream-200 overflow-hidden">
          {d.problems.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{p.title}</p>
                <p className="truncate text-sm text-slate-500">{p.description}</p>
              </div>
              <span className="text-xs text-slate-400">by {p.createdBy?.username ?? '—'} · {formatDate(p.createdAt)}</span>
              <Badge color="gray">{p.topic}</Badge>
              <Badge color={difficultyColor(p.difficulty)}>{p.difficulty}</Badge>
            </div>
          ))}
        </div>
      ))}

      {tab === 'quizzes' && (d.quizzes.length === 0 ? <EmptyState title="No quizzes yet" /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {d.quizzes.map((q) => {
            const list = attemptsFor(q.id);
            const avg = list.length ? Math.round(list.reduce((s, a) => s + a.percent, 0) / list.length) : null;
            return (
              <div key={q.id} className="card flex flex-col p-5">
                <h2 className="font-semibold text-ink">{q.title}</h2>
                <p className="mt-1 flex-1 text-sm text-slate-500">{q.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{q.durationMinutes} min</span>
                  <span className="inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" />{q.totalQuestions} questions</span>
                  <span className="inline-flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />Pass {q.passingScore ?? 0}%</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-cream-200 pt-3 text-sm">
                  <span className="text-slate-600">{list.length} attempt{list.length === 1 ? '' : 's'}</span>
                  {avg !== null && <Badge color={avg >= (q.passingScore ?? 0) ? 'green' : 'amber'}>Avg {avg}%</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {creating === 'problems' && <Modal title="New coding problem" onClose={() => setCreating(null)}><ProblemForm onSaved={saved} onClose={() => setCreating(null)} /></Modal>}
      {creating === 'quizzes' && <Modal title="New quiz" onClose={() => setCreating(null)}><QuizForm onSaved={saved} onClose={() => setCreating(null)} /></Modal>}
    </div>
  );
}
