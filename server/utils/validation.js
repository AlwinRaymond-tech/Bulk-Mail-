const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validateEmail = (email) => {
  if (email === undefined || email === null || String(email).trim() === '') {
    return { valid: false, message: 'Email is required.' };
  }

  const trimmed = String(email).trim();

  if (/\s/.test(email)) {
    return { valid: false, message: 'Email cannot contain spaces.' };
  }

  if (trimmed.length > 254) {
    return { valid: false, message: 'Email is too long.' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  return { valid: true, value: trimmed.toLowerCase() };
};

const validatePassword = (password, { forSignup = false } = {}) => {
  if (password === undefined || password === null || password === '') {
    return { valid: false, message: 'Password is required.' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must be under 128 characters.' };
  }

  if (forSignup) {
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must include at least one lowercase letter.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must include at least one uppercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must include at least one number.' };
    }
  }

  return { valid: true };
};

const validateName = (name) => {
  const trimmed = String(name || '').trim();

  if (!trimmed) {
    return { valid: true, value: '' };
  }

  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters.' };
  }

  if (trimmed.length > 50) {
    return { valid: false, message: 'Name must be under 50 characters.' };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return {
      valid: false,
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes.',
    };
  }

  return { valid: true, value: trimmed };
};

module.exports = {
  EMAIL_REGEX,
  validateEmail,
  validatePassword,
  validateName,
};
