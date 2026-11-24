import { useCallback, useEffect, useState } from 'react';
import { applicationsApi, quizzesApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { progress } from './progress';

// Percentage score for an attempt. The question count is stored in answersJson
// when the attempt is submitted; older attempts fall back to the quiz's totalQuestions.
export function attemptPercent(attempt) {
  let total = attempt.quiz?.totalQuestions;
  try {
    const parsed = JSON.parse(attempt.answersJson || '{}');
    if (parsed.total) total = parsed.total;
  } catch { /* not JSON */ }
  if (!total) return 0;
  return Math.round((attempt.scoreObtained / total) * 100);
}

/**
 * Everything the student dashboard and drives page need about the logged-in student.
 * `readinessScore` is the average quiz percentage, used for drive eligibility.
 */
export function useStudentData() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '', attempts: [], applications: [], solved: [] });

  const load = useCallback(async () => {
    if (!user) return;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const [attempts, applications] = await Promise.all([
        quizzesApi.attemptsByStudent(user.id),
        applicationsApi.byStudent(user.id),
      ]);
      const local = progress.get(user.id);
      setState({
        loading: false,
        error: '',
        attempts: attempts.map((a) => ({ ...a, percent: attemptPercent(a) })),
        applications: [...applications, ...Object.values(local.sampleApplications)],
        solved: Object.values(local.solved),
      });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const readinessScore = state.attempts.length
    ? Math.round(state.attempts.reduce((sum, a) => sum + a.percent, 0) / state.attempts.length)
    : null;

  return { ...state, readinessScore, reload: load };
}
