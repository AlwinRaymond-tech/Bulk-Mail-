import { ApiError } from './utils/validation';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const getToken = () => localStorage.getItem('token');

async function parseResponse(res) {
  let data = {};

  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError(
      res.ok ? 'Invalid server response.' : 'Server error. Please try again.',
      'SERVER_ERROR'
    );
  }

  if (!res.ok) {
    throw new ApiError(data.message || 'Request failed', data.code, data.details, res.status);
  }

  return data;
}

async function request(url, options = {}, { timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return parseResponse(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') {
      throw new ApiError(
        'The server is taking too long to respond. Please check your SMTP settings and try again.',
        'TIMEOUT'
      );
    }
    throw new ApiError(
      'Cannot connect to server. Make sure the backend is running on port 5000.',
      'NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timeout);
  }
}

const formatUser = (user = {}) => ({
  ...user,
  id: user.id || user._id,
});

const normalizeAuthResponse = (data) => {
  const payload = data.data || data;
  return {
    ...data,
    token: payload.token,
    user: formatUser(payload.user),
  };
};

const normalizeRecipients = (recipients) => {
  if (Array.isArray(recipients)) {
    return recipients.map((email) => email.trim()).filter(Boolean);
  }

  return recipients
    .split(/[,;\n]+/)
    .map((email) => email.trim())
    .filter(Boolean);
};

export const api = {
  async signup({ name, email, password, confirmPassword }) {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    };

    try {
      return normalizeAuthResponse(await request(`${API_BASE}/auth/signup`, options));
    } catch (err) {
      if (err.status !== 404) throw err;
      return normalizeAuthResponse(await request(`${API_BASE}/auth/register`, options));
    }
  },

  async login(email, password) {
    return normalizeAuthResponse(await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }));
  },

  async verifyToken() {
    const token = getToken();
    if (!token) return { valid: false };

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const user = data.data?.user || data.user;
        return user ? { valid: true, user: formatUser(user) } : { valid: false };
      }
    } catch {
      // Fall through to the newer local API route.
    }

    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return res.json();
      return { valid: false };
    } catch {
      return { valid: false };
    }
  },

  async sendEmail({ subject, body, recipients }) {
    return request(
      `${API_BASE}/emails/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ subject, body, recipients: normalizeRecipients(recipients) }),
      },
      { timeoutMs: 45000 }
    );
  },

  async getHistory(page = 1, limit = 10) {
    return request(`${API_BASE}/emails/history?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },

  async getEmailById(id) {
    return request(`${API_BASE}/emails/history/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
};
