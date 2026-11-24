import { lazy } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Loader } from './components/ui';
import { LoginPage, SignupPage } from './pages/AuthPages';
import { homeFor, isStaff } from './roles';

// Pages load on demand so the login screen doesn't download the code editor and chart libraries.
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const ProblemWorkspacePage = lazy(() => import('./pages/ProblemWorkspacePage'));
const QuizzesPage = lazy(() => import('./pages/QuizzesPage'));
const QuizTakePage = lazy(() => import('./pages/QuizTakePage'));
const DrivesPage = lazy(() => import('./pages/DrivesPage'));
const MentorDashboardPage = lazy(() => import('./pages/mentor/MentorDashboardPage'));
const MentorStudentsPage = lazy(() => import('./pages/mentor/MentorStudentsPage'));
const MentorContentPage = lazy(() => import('./pages/mentor/MentorContentPage'));
const MentorApplicationsPage = lazy(() => import('./pages/mentor/MentorApplicationsPage'));

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader full label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Students see the student portal; mentors and admins see the mentor portal. */
function RequireRole({ staff, children }) {
  const { user } = useAuth();
  if (isStaff(user) !== staff) return <Navigate to={homeFor(user)} replace />;
  return children;
}

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={homeFor(user)} replace />;
}

function NotFound() {
  const { user } = useAuth();
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <p className="mt-2 text-slate-600">This page doesn't exist.</p>
      <Link to={homeFor(user)} className="btn-primary mt-6">Go to dashboard</Link>
    </div>
  );
}

const student = (el) => <RequireRole staff={false}>{el}</RequireRole>;
const mentor = (el) => <RequireRole staff>{el}</RequireRole>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<RoleHome />} />
            {/* Student portal */}
            <Route path="/dashboard" element={student(<DashboardPage />)} />
            <Route path="/practice" element={student(<PracticePage />)} />
            <Route path="/practice/:id" element={student(<ProblemWorkspacePage />)} />
            <Route path="/quizzes" element={student(<QuizzesPage />)} />
            <Route path="/quizzes/:id" element={student(<QuizTakePage />)} />
            <Route path="/drives" element={student(<DrivesPage />)} />
            {/* Mentor / admin portal */}
            <Route path="/mentor" element={mentor(<MentorDashboardPage />)} />
            <Route path="/mentor/students" element={mentor(<MentorStudentsPage />)} />
            <Route path="/mentor/content" element={mentor(<MentorContentPage />)} />
            <Route path="/mentor/applications" element={mentor(<MentorApplicationsPage />)} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
