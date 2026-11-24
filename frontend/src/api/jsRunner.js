// Runs a student's JavaScript `solve(input)` against test cases inside a Web Worker,
// so an infinite loop can be killed and the code can't touch the page.
// Other languages need the evaluation backend (Third-Party APIs & Evaluation module).

const WORKER_SOURCE = `
self.onmessage = (e) => {
  const { code, testCases } = e.data;
  let solve;
  try {
    solve = new Function(code + '\\n;return typeof solve === "function" ? solve : undefined;')();
  } catch (err) {
    self.postMessage({ compileError: String(err) });
    return;
  }
  if (typeof solve !== 'function') {
    self.postMessage({ compileError: 'Define a function named solve(input).' });
    return;
  }
  const results = testCases.map((tc, i) => {
    const start = performance.now();
    try {
      const input = JSON.parse(JSON.stringify(tc.input));
      const actual = solve(input);
      const ms = performance.now() - start;
      return { index: i, input: tc.input, expected: tc.output, actual, ms, error: null };
    } catch (err) {
      return { index: i, input: tc.input, expected: tc.output, actual: undefined, ms: performance.now() - start, error: String(err) };
    }
  });
  self.postMessage({ results });
};
`;

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function runJavaScript(code, testCases, timeLimitSec = 2) {
  return new Promise((resolve) => {
    const blob = new Blob([WORKER_SOURCE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const done = (payload) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(payload);
    };
    const timer = setTimeout(
      () => done({ status: 'TIME_LIMIT_EXCEEDED', message: `Time limit of ${timeLimitSec}s exceeded`, results: [] }),
      Math.max(1, timeLimitSec) * 1000 + 500,
    );

    worker.onmessage = (e) => {
      if (e.data.compileError) {
        done({ status: 'COMPILATION_ERROR', message: e.data.compileError, results: [] });
        return;
      }
      const results = e.data.results.map((r) => ({ ...r, passed: !r.error && sameValue(r.actual, r.expected) }));
      const passed = results.filter((r) => r.passed).length;
      const status = results.some((r) => r.error)
        ? 'RUNTIME_ERROR'
        : passed === results.length ? 'ACCEPTED' : 'WRONG_ANSWER';
      done({ status, results, passed, total: results.length });
    };
    worker.onerror = (e) => done({ status: 'RUNTIME_ERROR', message: e.message, results: [] });
    worker.postMessage({ code, testCases });
  });
}
