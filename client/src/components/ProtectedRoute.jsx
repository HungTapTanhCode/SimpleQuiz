import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ adminOnly = false }) {
  const user = useSelector(state => state.auth.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !user.admin) return <Navigate to="/quizzes" replace />;
  return <Outlet />;
}
