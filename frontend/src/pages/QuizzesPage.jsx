import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, Trophy } from 'lucide-react';
import { quizzesApi } from '../api/endpoints';
import { useStudentData } from '../data/useStudentData';
import { Alert, Badge, EmptyState, Loader, PageHeader, formatDateTime } from '../components/ui';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState(null);
  const [error, setError] = useState('');
  const { attempts, loading } = useStudentData();

  useEffect(() => {
    quizzesApi.list().then(setQuizzes).catch((e) => { setError(e.message); setQuizzes([]); });
  }, []);

  if (!quizzes || loading) return <Loader label="Loading quizzes…" />;

  const bestFor = (quizId) => {
    const mine = attempts.filter((a) => a.quiz?.id === quizId);
    return mine.length ? Math.max(...mine.map((a) => a.percent)) : null;
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Quizzes" subtitle="Timed assessments. Your scores count towards placement eligibility." />
      {error && <Alert type="error">{error}</Alert>}

      {quizzes.length === 0 ? <EmptyState title="No quizzes available yet" /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((q) => {
            const best = bestFor(q.id);
            const passed = best !== null && best >= (q.passingScore ?? 0);
            return (
              <div key={q.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">{q.title}</h2>
                  {best !== null && <Badge color={passed ? 'green' : 'amber'}>Best {best}%</Badge>}
                </div>
                <p className="mt-1 flex-1 text-sm text-slate-500">{q.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{q.durationMinutes} min</span>
                  <span className="inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" />{q.totalQuestions} questions</span>
                  <span className="inline-flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />Pass {q.passingScore ?? 0}%</span>
                </div>
                <Link to={`/quizzes/${q.id}`} className="btn-primary mt-4">{best === null ? 'Start quiz' : 'Retake quiz'}</Link>
              </div>
            );
          })}
        </div>
      )}

      {attempts.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold text-slate-900">Your attempts</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr><th className="px-5 py-3">Quiz</th><th className="px-5 py-3">Score</th><th className="px-5 py-3">Time taken</th><th className="px-5 py-3">Completed</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{a.quiz?.title}</td>
                    <td className="px-5 py-3"><Badge color={a.percent >= (a.quiz?.passingScore ?? 0) ? 'green' : 'red'}>{a.percent}%</Badge></td>
                    <td className="px-5 py-3 text-slate-600">{a.timeTakenMinutes} min</td>
                    <td className="px-5 py-3 text-slate-600">{formatDateTime(a.completedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
