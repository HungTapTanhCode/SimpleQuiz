import { ArrowRight, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import { clearAuthError, signup } from '../features/auth/authSlice';

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', password: '', admin: false });
  const { status, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const submit = async event => {
    event.preventDefault();
    const result = await dispatch(signup(form));
    if (signup.fulfilled.match(result)) navigate('/login', { state: { registered: true } });
  };

  return (
    <div className="auth-screen">
      <section className="auth-visual signup-visual">
        <img src="/fpt.jpg" alt="FPT University" className="institution-mark" />
        <div className="auth-visual-copy"><span className="eyebrow">Choose your workspace role</span><h1>One account.<br />A clear purpose.</h1><div className="role-explainer"><div><UserRound /><span><strong>Participant</strong><small>Browse and take available quizzes.</small></span></div><div><ShieldCheck /><span><strong>Administrator</strong><small>CRUD quizzes, questions, and view users.</small></span></div></div></div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">Create account</p><h2>Join SimpleQuiz</h2><p className="subtle">Accounts are participants by default. Select Admin only for management access.</p>
          <ErrorAlert message={error} />
          <form onSubmit={submit}>
            <label className="form-label" htmlFor="username">Username</label>
            <input id="username" className="form-control form-control-lg" required autoComplete="username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Choose a username" />
            <label className="form-label mt-3" htmlFor="password">Password</label>
            <input id="password" className="form-control form-control-lg" type="password" minLength="6" required autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
            <label className="admin-toggle mt-4"><input type="checkbox" checked={form.admin} onChange={e => setForm({ ...form, admin: e.target.checked })} /><span><strong>Register as administrator</strong><small>Enables Quiz and Question management.</small></span></label>
            <button className="btn btn-primary btn-lg w-100 mt-4" disabled={status === 'loading'}>{status === 'loading' ? 'Creating account...' : <>Create account <ArrowRight size={18} /></>}</button>
          </form>
          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
