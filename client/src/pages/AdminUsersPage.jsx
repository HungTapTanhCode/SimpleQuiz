import { ShieldCheck, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import { fetchUsers } from '../features/users/usersSlice';

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(state => state.users);
  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);
  return <><div className="page-heading-row"><div><span className="eyebrow">Access directory</span><h1>Registered users</h1><p>Review participant and administrator accounts.</p></div><div className="summary-pills"><span>{items.length} accounts</span><span>{items.filter(item => item.admin).length} admins</span></div></div><ErrorAlert message={error} />{status === 'loading' ? <LoadingState /> : <div className="user-table-wrap"><table className="table align-middle"><thead><tr><th>User</th><th>Role</th><th>Created</th><th>ID</th></tr></thead><tbody>{items.map(user => <tr key={user._id}><td><div className="user-cell"><span>{user.username?.charAt(0).toUpperCase()}</span><strong>{user.username}</strong></div></td><td><span className={`role-pill ${user.admin ? 'admin' : ''}`}>{user.admin ? <ShieldCheck size={14} /> : <UserRound size={14} />}{user.admin ? 'Admin' : 'Participant'}</span></td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td><td><code>{user._id}</code></td></tr>)}</tbody></table></div>}</>;
}
