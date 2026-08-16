import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiUser3Line } from 'react-icons/ri';
import AuthLayout from '../../components/Auth/AuthLayout.jsx';
import FormField from '../../components/Auth/FormField.jsx';
import PasswordInput from '../../components/Auth/PasswordInput.jsx';
import OAuthButtons from '../../components/Auth/OAuthButtons.jsx';
import Button from '../../components/Common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './Login.scss';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithProvider } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('email'); // 'email' | 'username'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  const validate = () => {
    const next = {};
    if (!identifier.trim()) {
      next.identifier = mode === 'email' ? 'Email is required.' : 'Username is required.';
    } else if (mode === 'email' && !/^\S+@\S+\.\S+$/.test(identifier)) {
      next.identifier = 'Enter a valid email address.';
    }
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ identifier, password, rememberMe });
      showToast('Welcome back!', { type: 'success' });
      navigate('/chat');
    } catch (err) {
      setErrors({ form: err.message || 'Could not sign in. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    try {
      await loginWithProvider(provider);
      showToast('Welcome back!', { type: 'success' });
      navigate('/chat');
    } catch {
      showToast('Could not connect. Please try again.', { type: 'error' });
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Log in to Aether" subtitle="Pick up right where you left off.">
      <div className="login-mode-toggle" role="tablist" aria-label="Login method">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'email'}
          className={mode === 'email' ? 'is-active' : ''}
          onClick={() => setMode('email')}
        >
          <RiMailLine /> Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'username'}
          className={mode === 'username' ? 'is-active' : ''}
          onClick={() => setMode('username')}
        >
          <RiUser3Line /> Username
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label={mode === 'email' ? 'Email address' : 'Username'} htmlFor="identifier" error={errors.identifier} required>
          <input
            id="identifier"
            type={mode === 'email' ? 'email' : 'text'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={mode === 'email' ? 'you@example.com' : 'yourusername'}
            autoComplete={mode === 'email' ? 'email' : 'username'}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password} required>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </FormField>

        <div className="auth-form__row">
          <label className="auth-form__checkbox">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="auth-form__link">
            Forgot password?
          </Link>
        </div>

        {errors.form && <p className="auth-form__error">{errors.form}</p>}

        <Button type="submit" variant="primary" size="lg" className="auth-form__submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </Button>
      </form>

      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <OAuthButtons onSelect={handleOAuth} loadingProvider={oauthLoading} />

      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Create one</Link>
      </p>
    </AuthLayout>
  );
}
