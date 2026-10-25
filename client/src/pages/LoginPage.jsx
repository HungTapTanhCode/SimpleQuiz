import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import { clearAuthError, login } from '../features/auth/authSlice';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { status, error, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => { if (user) navigate(location.state?.from?.pathname || '/quizzes', { replace: true }); }, [user, navigate, location.state]);

  const submit = event => {
    event.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="auth-screen">
      <section className="auth-visual">
        <img src="/fpt.jpg" alt="FPT University" className="institution-mark" />
        <div className="auth-visual-copy"><span className="eyebrow">Full-stack quiz platform</span><h1>Learn with focus.<br />Manage with clarity.</h1><p>Sign in to take assigned quizzes or manage the complete question bank as an administrator.</p></div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <span className="auth-symbol"><LockKeyhole size={22} /></span>
          <p className="eyebrow">Welcome back</p><h2>Sign in to SimpleQuiz</h2><p className="subtle">Use the account created for your class workspace.</p>
          {location.state?.registered && <div className="alert alert-success">Account created. You can sign in now.</div>}
          <ErrorAlert message={error} />
          <form onSubmit={submit}>
            <label className="form-label" htmlFor="username">Username</label>
            <input id="username" className="form-control form-control-lg" autoComplete="username" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Enter your username" />
            <label className="form-label mt-3" htmlFor="password">Password</label>
            <div className="password-field"><input id="password" className="form-control form-control-lg" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <button className="btn btn-primary btn-lg w-100 mt-4" disabled={status === 'loading'}>{status === 'loading' ? 'Signing in...' : <>Sign in <ArrowRight size={18} /></>}</button>
          </form>
          <p className="auth-switch">Need an account? <Link to="/signup">Create one</Link></p>
        </div>
      </section>
    </div>
  );
}
