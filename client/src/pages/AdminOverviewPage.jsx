import { BookOpenCheck, HelpCircle, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchQuestions } from '../features/questions/questionsSlice';
import { fetchQuizzes } from '../features/quizzes/quizzesSlice';
import { fetchUsers } from '../features/users/usersSlice';

export default function AdminOverviewPage() {
  const dispatch = useDispatch();
  const quizzes = useSelector(state => state.quizzes.items);
  const questions = useSelector(state => state.questions.items);
  const users = useSelector(state => state.users.items);
  useEffect(() => { dispatch(fetchQuizzes()); dispatch(fetchQuestions()); dispatch(fetchUsers()); }, [dispatch]);
  const stats = [
    { label: 'Quizzes', value: quizzes.length, icon: BookOpenCheck, to: '/admin/quizzes', note: 'Assessments available' },
    { label: 'Questions', value: questions.length, icon: HelpCircle, to: '/admin/questions', note: 'Reusable question bank' },
    { label: 'Users', value: users.length, icon: Users, to: '/admin/users', note: `${users.filter(user => user.admin).length} administrators` }
  ];
  return <><div className="page-heading-row"><div><span className="eyebrow">Administration</span><h1>Workspace overview</h1><p>Monitor content and move quickly into each management area.</p></div></div><div className="stat-grid">{stats.map(({ label, value, icon: Icon, to, note }) => <Link to={to} className="stat-card" key={label}><span><Icon size={20} /></span><strong>{value}</strong><h2>{label}</h2><p>{note}</p></Link>)}</div><section className="admin-callout"><div><h2>Keep the quiz library ready</h2><p>Create questions first, then assign them when creating or editing a quiz.</p></div><Link className="btn btn-primary" to="/admin/questions">Manage questions</Link></section></>;
}
