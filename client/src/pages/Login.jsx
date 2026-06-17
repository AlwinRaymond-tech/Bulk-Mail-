import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateLoginPassword } from '../utils/validation';
import PasswordInput from '../components/PasswordInput';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (field, value) => {
    if (field === 'email') return validateEmail(value);
    if (field === 'password') return validateLoginPassword(value);
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === 'email' ? email : password;
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    setError('');
    setErrorCode('');

    if (touched[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(email),
      password: validateLoginPassword(password),
    };

    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorCode('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setErrorCode(err.code || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footer={
        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/signup">Create one free</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className={`alert ${errorCode === 'USER_NOT_FOUND' ? 'alert-warning' : 'alert-error'}`}>
              {error}
              {errorCode === 'USER_NOT_FOUND' && (
                <div className="alert-action">
                  <Link
                    to="/signup"
                    state={{ email: email.trim() }}
                    className="alert-link"
                  >
                    Create an account
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email"
              className={touched.email && fieldErrors.email ? 'input-error' : ''}
              autoFocus
            />
            {touched.email && fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              className={touched.password && fieldErrors.password ? 'input-error' : ''}
              autoComplete="current-password"
            />
            {touched.password && fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

        <button type="submit" className="btn btn-primary btn-full btn-send" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
}
