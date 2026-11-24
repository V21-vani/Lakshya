import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { ArrowLeft, CheckCircle2, Clock, Cpu, Play, RotateCcw, XCircle } from 'lucide-react';
import { problemsApi } from '../api/endpoints';
import { runJavaScript } from '../api/jsRunner';
import { useAuth } from '../context/AuthContext';
import { progress } from '../data/progress';
import { LANGUAGES, parseTestCases, starterCode } from '../data/sampleData';
import { Alert, Badge, Loader, difficultyColor } from '../components/ui';

const EXTENSIONS = { javascript: javascript(), python: python(), java: java(), cpp: cpp() };

const STATUS_LABEL = {
  ACCEPTED: { text: 'Accepted', color: 'green' },
  WRONG_ANSWER: { text: 'Wrong answer', color: 'red' },
  RUNTIME_ERROR: { text: 'Runtime error', color: 'red' },
  COMPILATION_ERROR: { text: 'Compilation error', color: 'red' },
  TIME_LIMIT_EXCEEDED: { text: 'Time limit exceeded', color: 'amber' },
};

const show = (v) => (v === undefined ? 'undefined' : JSON.stringify(v));

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="whitespace-pre-wrap text-sm text-slate-600">{children}</div>
    </div>
  );
}

function TestResults({ result }) {
  if (!result) {
    return <p className="text-sm text-slate-500">Run your code to see test results here.</p>;
  }
  const label = STATUS_LABEL[result.status];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge color={label.color}>{label.text}</Badge>
        {result.total !== undefined && <span className="text-sm text-slate-600">{result.passed}/{result.total} test cases passed</span>}
      </div>
      {result.message && <pre className="overflow-x-auto rounded-lg bg-red-50 p-3 text-xs text-red-700">{result.message}</pre>}
      {result.results.map((r) => (
        <div key={r.index} className={`rounded-lg border p-3 text-xs ${r.passed ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
          <div className="mb-2 flex items-center gap-2 font-medium">
            {r.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            Test case {r.index + 1}
            <span className="ml-auto font-normal text-slate-500">{r.ms.toFixed(1)} ms</span>
          </div>
          <dl className="grid grid-cols-[80px_1fr] gap-y-1 font-mono">
            <dt className="text-slate-500">Input</dt><dd className="break-all">{show(r.input)}</dd>
            <dt className="text-slate-500">Expected</dt><dd className="break-all">{show(r.expected)}</dd>
            <dt className="text-slate-500">Output</dt><dd className="break-all">{r.error ? <span className="text-red-600">{r.error}</span> : show(r.actual)}</dd>
          </dl>
        </div>
      ))}
    </div>
  );
}

export default function ProblemWorkspacePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    problemsApi.get(id)
      .then((p) => { setProblem(p); setCode(starterCode('javascript', p)); })
      .catch((e) => setError(e.status === 404 ? 'Problem not found.' : e.message));
  }, [id]);

  const testCases = useMemo(() => parseTestCases(problem), [problem]);
  const lang = LANGUAGES.find((l) => l.id === language);

  if (error) return <Alert type="error">{error} <Link to="/practice" className="underline">Back to problems</Link></Alert>;
  if (!problem) return <Loader label="Loading problem…" />;

  const changeLanguage = (next) => {
    setLanguage(next);
    setCode(starterCode(next, problem));
    setResult(null);
    setNotice('');
  };

  const run = async () => {
    setNotice('');
    if (!lang.runnable) {
      setResult(null);
      setNotice(`Running ${lang.label} needs the code evaluation service, which isn't connected yet. JavaScript runs right in your browser.`);
      return;
    }
    if (!testCases.length) {
      setNotice('This problem has no test cases yet.');
      return;
    }
    setRunning(true);
    const r = await runJavaScript(code, testCases, problem.timeLimit);
    setResult(r);
    setRunning(false);
    if (r.status === 'ACCEPTED') {
      progress.markSolved(user.id, problem, lang.label);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Link to="/practice" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> All problems
      </Link>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Problem statement */}
        <div className="card space-y-5 p-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{problem.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge color={difficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
              <Badge color="gray">{problem.topic}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" />{problem.timeLimit}s</span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Cpu className="h-3.5 w-3.5" />{problem.memoryLimit} MB</span>
            </div>
          </div>
          <Section title="Description">{problem.description}</Section>
          <Section title="Input format">{problem.inputFormat}</Section>
          <Section title="Output format">{problem.outputFormat}</Section>
          <Section title="Constraints">{problem.constraints}</Section>
          {testCases.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Examples</h3>
              <div className="space-y-2">
                {testCases.slice(0, 2).map((tc, i) => (
                  <pre key={i} className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                    {`Input:  ${JSON.stringify(tc.input)}\nOutput: ${JSON.stringify(tc.output)}`}
                  </pre>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor + results */}
        <div className="flex flex-col gap-4">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2">
              <select className="input w-auto py-1.5" value={language} onChange={(e) => changeLanguage(e.target.value)} aria-label="Language">
                {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
              <button className="btn-secondary ml-auto py-1.5" onClick={() => changeLanguage(language)} title="Reset code">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
              <button className="btn-primary py-1.5" onClick={run} disabled={running}>
                <Play className="h-4 w-4" /> {running ? 'Running…' : 'Run tests'}
              </button>
            </div>
            <CodeMirror value={code} height="380px" extensions={[EXTENSIONS[language]]} onChange={setCode}
              basicSetup={{ tabSize: language === 'python' ? 4 : 2 }} />
          </div>

          <div className="card p-4">
            <h2 className="mb-3 font-semibold text-slate-900">Test results</h2>
            {notice ? <Alert type="info">{notice}</Alert> : <TestResults result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}
