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
    throw new ApiError(data.message || 'Request failed', data.code, data.details);
  }

  return data;
}

async function request(url, options) {
  try {
    const res = await fetch(url, options);
    return parseResponse(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Cannot connect to server. Make sure the backend is running on port 5000.',
      'NETWORK_ERROR'
    );
  }
}

export const api = {
  async signup({ name, email, password, confirmPassword }) {
    return request(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  },

  async login(email, password) {
    return request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  async verifyToken() {
    const token = getToken();
    if (!token) return { valid: false };

    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch {
      return { valid: false };
    }
  },

  async sendEmail({ subject, body, recipients }) {
    return request(`${API_BASE}/emails/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ subject, body, recipients }),
    });
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
