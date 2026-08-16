import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiMailSendLine } from 'react-icons/ri';
import AuthLayout from '../../components/Auth/AuthLayout.jsx';
import FormField from '../../components/Auth/FormField.jsx';
import PasswordInput from '../../components/Auth/PasswordInput.jsx';
import PasswordStrengthMeter, { isPasswordValid } from '../../components/Auth/PasswordStrengthMeter.jsx';
import OAuthButtons from '../../components/Auth/OAuthButtons.jsx';
import Button from '../../components/Common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './Signup.scss';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithProvider, pendingVerification, verifyEmail, resendVerification } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [resent, setResent] = useState(false);

  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!username.trim()) next.username = 'Username is required.';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) next.username = '3-20 characters: letters, numbers, underscore.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    else if (!isPasswordValid(password)) next.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';
    if (!acceptTerms) next.acceptTerms = 'You must accept the terms to continue.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({ fullName, username, email, password });
      showToast('Account created successfully!', { type: 'success' });
      navigate('/chat');
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    try {
      await loginWithProvider(provider);
      showToast('Account created!', { type: 'success' });
      navigate('/chat');
    } catch {
      showToast('Could not connect. Please try again.', { type: 'error' });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyEmail();
      showToast('Email verified — welcome to Aether!', { type: 'success' });
      navigate('/chat');
    } catch {
      showToast('Verification failed. Please try again.', { type: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    await resendVerification();
    setResent(true);
    showToast('Verification email resent', { type: 'info' });
    setTimeout(() => setResent(false), 4000);
  };

  if (pendingVerification) {
    return (
      <AuthLayout eyebrow="One more step" title="Verify your email" subtitle={`We sent a verification link to ${pendingVerification.email}`}>
        <motion.div
          className="verify-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="verify-panel__icon">
            <RiMailSendLine />
          </div>
          <p>
            Click the link in the email to verify your account. For this demo, you can simulate that click
            directly below.
          </p>
          <Button variant="primary" size="lg" className="verify-panel__submit" onClick={handleVerify} disabled={verifying}>
            {verifying ? 'Verifying…' : "I've verified — continue"}
          </Button>
          <button className="verify-panel__resend" onClick={handleResend} disabled={resent}>
            {resent ? 'Email resent' : "Didn't get it? Resend email"}
          </button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout eyebrow="Get started" title="Create your account" subtitle="Free to start — no credit card required.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Full name" htmlFor="fullName" error={errors.fullName} required>
          <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jordan Avery" autoComplete="name" />
        </FormField>

        <FormField label="Username" htmlFor="username" error={errors.username} required>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jordanavery" autoComplete="username" />
        </FormField>

        <FormField label="Email address" htmlFor="email" error={errors.email} required>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password} required>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Create a password" />
          <PasswordStrengthMeter password={password} />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword} required>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter your password"
          />
        </FormField>

        <label className="auth-form__terms">
          <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
          <span>
            I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
          </span>
        </label>
        {errors.acceptTerms && <p className="auth-form__error">{errors.acceptTerms}</p>}
        {errors.form && <p className="auth-form__error">{errors.form}</p>}

        <Button type="submit" variant="primary" size="lg" className="auth-form__submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <div className="auth-divider">
        <span>or sign up with</span>
      </div>

      <OAuthButtons onSelect={handleOAuth} loadingProvider={oauthLoading} />

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
