import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import AdminQuizzesPage from './pages/AdminQuizzesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import LoginPage from './pages/LoginPage';
import QuizListPage from './pages/QuizListPage';
import QuizResultPage from './pages/QuizResultPage';
import SignupPage from './pages/SignupPage';
import TakeQuizPage from './pages/TakeQuizPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/quizzes" replace />} />
          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quizzes/:quizId/play" element={<TakeQuizPage />} />
          <Route path="/quizzes/:quizId/result" element={<QuizResultPage />} />
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
            <Route path="/admin/questions" element={<AdminQuestionsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/quizzes" replace />} />
    </Routes>
  );
}
