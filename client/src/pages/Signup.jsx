import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  getPasswordStrength,
} from '../utils/validation';
import PasswordInput from '../components/PasswordInput';
import AuthLayout from '../components/AuthLayout';

export default function Signup() {
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);

  const validateField = (field, values) => {
    switch (field) {
      case 'name':
        return validateName(values.name);
      case 'email':
        return validateEmail(values.email);
      case 'password':
        return validatePassword(values.password, { forSignup: true });
      case 'confirmPassword':
        return validateConfirmPassword(values.password, values.confirmPassword);
      default:
        return '';
    }
  };

  const getValues = (overrides = {}) => ({
    name,
    email,
    password,
    confirmPassword,
    ...overrides,
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [field]: validateField(field, getValues()),
    }));
  };

  const handleChange = (field, value) => {
    const updates = { [field]: value };
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);

    setError('');
    setErrorCode('');

    const values = getValues(updates);
    const nextErrors = { ...fieldErrors };

    if (touched[field]) {
      nextErrors[field] = validateField(field, values);
    }

    if (field === 'password' && touched.confirmPassword) {
      nextErrors.confirmPassword = validateField('confirmPassword', values);
    }

    setFieldErrors(nextErrors);
  };

  const validateForm = () => {
    const values = getValues();
    const errors = {
      name: validateName(values.name),
      email: validateEmail(values.email),
      password: validatePassword(values.password, { forSignup: true }),
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
    };

    setFieldErrors(errors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorCode('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
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
      title="Create your account"
      subtitle="Start sending bulk emails in minutes"
      footer={
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className={`alert ${errorCode === 'USER_EXISTS' ? 'alert-warning' : 'alert-error'}`}>
              {error}
              {errorCode === 'USER_EXISTS' && (
                <div className="alert-action">
                  <Link to="/login" state={{ email: email.trim() }} className="alert-link">
                    Sign in instead
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Enter your name (optional)"
              className={touched.name && fieldErrors.name ? 'input-error' : ''}
              autoFocus={!location.state?.email}
            />
            {touched.name && fieldErrors.name && (
              <span className="field-error">{fieldErrors.name}</span>
            )}
          </div>

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
              autoFocus={!!location.state?.email}
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
              placeholder="Min 8 chars, upper, lower & number"
              className={touched.password && fieldErrors.password ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {password && (
              <div className={`password-strength ${passwordStrength.className}`}>
                <div className="strength-bar">
                  <div className="strength-fill" data-strength={passwordStrength.score} />
                </div>
                <span className="strength-label">{passwordStrength.label}</span>
              </div>
            )}
            {touched.password && fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
            <span className="field-hint">
              Use at least 8 characters with uppercase, lowercase, and a number.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Confirm your password"
              className={touched.confirmPassword && fieldErrors.confirmPassword ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {touched.confirmPassword && fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

        <button type="submit" className="btn btn-primary btn-full btn-send" disabled={loading}>
          {loading ? 'Creating account...' : 'Get Started'}
        </button>
      </form>
    </AuthLayout>
  );
}
