import { BookOpenCheck, HelpCircle, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import AppFooter from './AppFooter';

export default function AppLayout() {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const signOut = () => { dispatch(logout()); navigate('/login'); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <NavLink className="brand" to="/quizzes"><span className="brand-icon">Q</span><span>SimpleQuiz<small>Learning workspace</small></span></NavLink>
        <nav className="side-nav" aria-label="Main navigation">
          <NavLink to="/quizzes"><BookOpenCheck size={18} /> Quizzes</NavLink>
          {user.admin && <NavLink to="/admin"><LayoutDashboard size={18} /> Overview</NavLink>}
          {user.admin && <NavLink to="/admin/questions"><HelpCircle size={18} /> Questions</NavLink>}
          {user.admin && <NavLink to="/admin/users"><Users size={18} /> Users</NavLink>}
        </nav>
        <div className="account-panel">
          <span className="avatar">{user.username?.charAt(0).toUpperCase() || 'U'}</span>
          <span className="account-copy"><strong>{user.username}</strong><small>{user.admin ? 'Administrator' : 'Quiz participant'}</small></span>
          <button className="icon-button" onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>
      <div className="content-column">
        <header className="topbar"><div><span className="status-dot" /> Connected to SimpleQuiz API</div><span className="role-indicator"><ShieldCheck size={15} /> {user.admin ? 'Admin access' : 'Participant access'}</span></header>
        <main className="page-content"><Outlet /></main>
        <AppFooter />
      </div>
    </div>
  );
}
