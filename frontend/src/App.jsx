import { lazy } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Loader } from './components/ui';
import { LoginPage, SignupPage } from './pages/AuthPages';

// Pages load on demand so the login screen doesn't download the code editor and chart libraries.
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const ProblemWorkspacePage = lazy(() => import('./pages/ProblemWorkspacePage'));
const QuizzesPage = lazy(() => import('./pages/QuizzesPage'));
const QuizTakePage = lazy(() => import('./pages/QuizTakePage'));
const DrivesPage = lazy(() => import('./pages/DrivesPage'));

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader full label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <p className="mt-2 text-slate-600">This page doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary mt-6">Go to dashboard</Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/:id" element={<ProblemWorkspacePage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quizzes/:id" element={<QuizTakePage />} />
            <Route path="/drives" element={<DrivesPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
