export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email) {
  if (!email?.trim()) return 'Email is required.';
  if (/\s/.test(email)) return 'Email cannot contain spaces.';
  if (email.trim().length > 254) return 'Email is too long.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
  return '';
}

export function validateLoginPassword(password) {
  if (!password) return 'Password is required.';
  return '';
}

export function validatePassword(password, { forSignup = false } = {}) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 128) return 'Password must be under 128 characters.';

  if (forSignup) {
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
  }

  return '';
}

export function validateName(name) {
  const trimmed = name?.trim() || '';
  if (!trimmed) return '';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 50) return 'Name must be under 50 characters.';
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
  }
  return '';
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', className: 'strength-weak' };
  if (score <= 4) return { score: 2, label: 'Fair', className: 'strength-fair' };
  return { score: 3, label: 'Strong', className: 'strength-strong' };
}

export class ApiError extends Error {
  constructor(message, code, details, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}
