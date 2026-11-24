import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { quizzesApi } from '../api/endpoints';
import { questionsForQuiz } from '../data/sampleData';
import { Alert, Badge, Loader } from '../components/ui';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function Intro({ quiz, questions, onStart }) {
  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">{quiz.title}</h1>
      <p className="mt-2 text-slate-500">{quiz.description}</p>
      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-lg font-semibold text-slate-900">{questions.length}</p><p className="text-slate-500">Questions</p></div>
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-lg font-semibold text-slate-900">{quiz.durationMinutes} min</p><p className="text-slate-500">Time limit</p></div>
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-lg font-semibold text-slate-900">{quiz.passingScore ?? 0}%</p><p className="text-slate-500">To pass</p></div>
      </div>
      <p className="mt-6 text-sm text-slate-500">The timer starts when you click Start, and the quiz submits automatically when time runs out.</p>
      <button className="btn-primary mt-6 w-full" onClick={onStart}>Start quiz</button>
    </div>
  );
}

function Results({ quiz, questions, answers, score, percent, onRetake }) {
  const passed = percent >= (quiz.passingScore ?? 0);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card p-8 text-center">
        <p className="text-sm font-medium text-slate-500">{quiz.title}</p>
        <p className={`mt-2 text-5xl font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>{percent}%</p>
        <p className="mt-2 text-slate-600">{score} of {questions.length} correct</p>
        <div className="mt-3"><Badge color={passed ? 'green' : 'red'}>{passed ? 'Passed' : 'Not passed'}</Badge></div>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn-secondary" onClick={onRetake}>Retake</button>
          <Link to="/quizzes" className="btn-primary">Back to quizzes</Link>
        </div>
      </div>
      <div className="space-y-3">
        {questions.map((q, i) => {
          const correct = answers[i] === q.answer;
          return (
            <div key={i} className="card p-4">
              <div className="flex items-start gap-2">
                {correct ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />}
                <p className="text-sm font-medium text-slate-900">{i + 1}. {q.q}</p>
              </div>
              <p className="ml-6 mt-1 text-sm text-slate-600">
                Correct answer: <b>{q.options[q.answer]}</b>
                {!correct && <> · Your answer: {answers[i] === undefined ? <i>not answered</i> : q.options[answers[i]]}</>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('intro'); // intro | running | submitting | done
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const startedAt = useRef(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    quizzesApi.get(id).then(setQuiz).catch((e) => setError(e.status === 404 ? 'Quiz not found.' : e.message));
  }, [id]);

  const questions = useMemo(() => (quiz ? questionsForQuiz(quiz) : []), [quiz]);

  const submit = useCallback(async () => {
    setPhase('submitting');
    const final = answersRef.current;
    const score = questions.reduce((n, q, i) => n + (final[i] === q.answer ? 1 : 0), 0);
    const percent = Math.round((score / questions.length) * 100);
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    try {
      await quizzesApi.submitAttempt(quiz.id, {
        scoreObtained: score,
        timeTakenMinutes: minutes,
        answersJson: JSON.stringify({ total: questions.length, answers: final }),
      });
      setError('');
    } catch (e) {
      setError(`Your result couldn't be saved: ${e.message}`);
    }
    setResult({ score, percent });
    setPhase('done');
  }, [questions, quiz]);

  // Countdown; auto-submit at zero.
  useEffect(() => {
    if (phase !== 'running') return undefined;
    if (secondsLeft <= 0) { submit(); return undefined; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, submit]);

  // Warn before leaving mid-quiz.
  useEffect(() => {
    if (phase !== 'running') return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [phase]);

  if (error && !quiz) return <Alert type="error">{error} <Link to="/quizzes" className="underline">Back to quizzes</Link></Alert>;
  if (!quiz) return <Loader label="Loading quiz…" />;

  const start = () => {
    setAnswers({});
    setCurrent(0);
    setResult(null);
    setSecondsLeft(quiz.durationMinutes * 60);
    startedAt.current = Date.now();
    setPhase('running');
  };

  if (phase === 'intro') return <Intro quiz={quiz} questions={questions} onStart={start} />;
  if (phase === 'submitting') return <Loader label="Submitting your answers…" />;
  if (phase === 'done') {
    return (
      <div className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <Results quiz={quiz} questions={questions} answers={answers} score={result.score} percent={result.percent} onRetake={start} />
      </div>
    );
  }

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const lowTime = secondsLeft <= 60;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="card flex items-center justify-between p-4">
        <div>
          <p className="font-semibold text-slate-900">{quiz.title}</p>
          <p className="text-xs text-slate-500">{answeredCount} of {questions.length} answered</p>
        </div>
        <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-semibold ${lowTime ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-900'}`}
          role="timer" aria-label="Time remaining">
          <Clock className="h-4 w-4" />{fmt(secondsLeft)}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="card p-6">
        <p className="text-xs font-medium uppercase text-slate-500">Question {current + 1} of {questions.length}</p>
        <h2 className="mt-2 text-lg font-medium text-slate-900">{q.q}</h2>
        <div className="mt-5 space-y-2" role="radiogroup">
          {q.options.map((opt, i) => {
            const selected = answers[current] === i;
            return (
              <button key={i} role="radio" aria-checked={selected}
                onClick={() => setAnswers({ ...answers, [current]: i })}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                  selected ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-slate-500'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="btn-secondary" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>Previous</button>
        <div className="flex flex-wrap justify-center gap-1.5">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to question ${i + 1}`}
              className={`h-8 w-8 rounded-md text-xs font-medium ${
                i === current ? 'bg-brand-600 text-white' : answers[i] !== undefined ? 'bg-brand-100 text-brand-700' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
        {current < questions.length - 1 ? (
          <button className="btn-primary" onClick={() => setCurrent((c) => c + 1)}>Next</button>
        ) : (
          <button className="btn-primary" onClick={() => {
            const unanswered = questions.length - answeredCount;
            if (unanswered === 0 || window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) submit();
          }}>Submit quiz</button>
        )}
      </div>
      <p className="text-center text-xs text-slate-400">
        <button className="hover:underline" onClick={() => { if (window.confirm('Leave this quiz? Your answers will be lost.')) navigate('/quizzes'); }}>Quit quiz</button>
      </p>
    </div>
  );
}
