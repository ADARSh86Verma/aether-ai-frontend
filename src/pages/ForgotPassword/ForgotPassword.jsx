import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiCheckboxCircleFill, RiKeyLine, RiMailLockLine } from 'react-icons/ri';
import AuthLayout from '../../components/Auth/AuthLayout.jsx';
import FormField from '../../components/Auth/FormField.jsx';
import PasswordInput from '../../components/Auth/PasswordInput.jsx';
import PasswordStrengthMeter, { isPasswordValid } from '../../components/Auth/PasswordStrengthMeter.jsx';
import OtpInput from '../../components/Auth/OtpInput.jsx';
import Button from '../../components/Common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './ForgotPassword.scss';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetFlow, requestPasswordReset, verifyResetCode, resetPassword, clearResetFlow } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Always start this flow clean.
  useEffect(() => {
    clearResetFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = !resetFlow ? 'email' : resetFlow.done ? 'success' : resetFlow.verified ? 'reset' : 'otp';

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result?.dev_code) {
        showToast(`Development reset code: ${result.dev_code}`, { type: 'info' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyResetCode(code);
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!isPasswordValid(newPassword)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(newPassword);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const result = await requestPasswordReset(resetFlow.email);
    if (result?.dev_code) {
      showToast(`Development reset code: ${result.dev_code}`, { type: 'info' });
    } else {
      showToast('Code resent to your email', { type: 'info' });
    }
  };

  const handleDone = () => {
    clearResetFlow();
    showToast('Password reset — please log in', { type: 'success' });
    navigate('/login');
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title={
        step === 'email'
          ? 'Reset your password'
          : step === 'otp'
          ? 'Check your email'
          : step === 'reset'
          ? 'Choose a new password'
          : 'Password reset'
      }
      subtitle={
        step === 'email'
          ? "We'll send a verification code to your email."
          : step === 'otp'
          ? `Enter the 6-digit code we sent to ${resetFlow?.email}`
          : step === 'reset'
          ? 'Make it something you don\u2019t use anywhere else.'
          : undefined
      }
    >
      {step === 'email' && (
        <form className="auth-form" onSubmit={handleRequestReset} noValidate>
          <FormField label="Email address" htmlFor="reset-email" error={error} required>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </FormField>
          <Button type="submit" variant="primary" size="lg" className="auth-form__submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset code'}
          </Button>
          <p className="auth-switch">
            Remembered it? <Link to="/login">Back to log in</Link>
          </p>
        </form>
      )}

      {step === 'otp' && (
        <form className="auth-form" onSubmit={handleVerifyCode} noValidate>
          <div className="reset-icon">
            <RiMailLockLine />
          </div>
          <OtpInput value={code} onChange={setCode} />
          {error && <p className="auth-form__error">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="auth-form__submit" disabled={loading || code.length < 6}>
            {loading ? 'Verifying…' : 'Verify code'}
          </Button>
          <button type="button" className="reset-resend" onClick={handleResend}>
            Resend code
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form className="auth-form" onSubmit={handleResetPassword} noValidate>
          <div className="reset-icon">
            <RiKeyLine />
          </div>
          <FormField label="New password" htmlFor="new-password" required>
            <PasswordInput id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            <PasswordStrengthMeter password={newPassword} />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirm-new-password" required>
            <PasswordInput
              id="confirm-new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          {error && <p className="auth-form__error">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="auth-form__submit" disabled={loading}>
            {loading ? 'Saving…' : 'Reset password'}
          </Button>
        </form>
      )}

      {step === 'success' && (
        <motion.div className="reset-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="reset-success__icon">
            <RiCheckboxCircleFill />
          </div>
          <p>Your password has been reset successfully.</p>
          <Button variant="primary" size="lg" className="auth-form__submit" onClick={handleDone}>
            Continue to log in
          </Button>
        </motion.div>
      )}
    </AuthLayout>
  );
}
