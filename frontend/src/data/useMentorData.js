import { useCallback, useEffect, useState } from 'react';
import { applicationsApi, drivesApi, problemsApi, quizzesApi } from '../api/endpoints';
import { attemptPercent } from './useStudentData';

/**
 * Everything the mentor portal shows, assembled from existing endpoints.
 * There is no "list students" endpoint yet, so the student list is built from
 * everyone who has attempted a quiz or applied to a drive.
 */
export function useMentorData() {
  const [state, setState] = useState({
    loading: true, error: '', quizzes: [], problems: [], drives: [], drivesAreSample: false,
    attempts: [], applications: [], students: [],
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const [quizzes, problems, { drives, isSample }] = await Promise.all([
        quizzesApi.list(), problemsApi.list(), drivesApi.list(),
      ]);
      const realDrives = drives.filter((d) => !d.sample);
      const [attemptLists, applicationLists] = await Promise.all([
        Promise.all(quizzes.map((q) => quizzesApi.attemptsByQuiz(q.id))),
        Promise.all(realDrives.map((d) => applicationsApi.byDrive(d.id))),
      ]);
      const attempts = attemptLists.flat().map((a) => ({ ...a, percent: attemptPercent(a) }));
      const applications = applicationLists.flat();

      const byId = new Map();
      const entry = (u) => {
        if (!byId.has(u.id)) byId.set(u.id, { ...u, attempts: [], applications: [] });
        return byId.get(u.id);
      };
      attempts.forEach((a) => a.student && entry(a.student).attempts.push(a));
      applications.forEach((a) => a.student && entry(a.student).applications.push(a));

      const students = [...byId.values()].map((s) => {
        const scores = s.attempts.map((a) => a.percent);
        const last = [...s.attempts, ...s.applications]
          .map((x) => x.completedAt || x.appliedAt).sort().at(-1);
        return {
          ...s,
          readiness: scores.length ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length) : null,
          best: scores.length ? Math.max(...scores) : null,
          lastActive: last,
        };
      }).sort((a, b) => (a.readiness ?? -1) - (b.readiness ?? -1));

      setState({
        loading: false, error: '', quizzes, problems, drives, drivesAreSample: isSample,
        attempts, applications, students,
      });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

// Students below this readiness score are flagged as needing attention.
export const ATTENTION_THRESHOLD = 60;
