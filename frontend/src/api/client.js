import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

export const userApi = {
  getInterests: () => api.get('/api/users/me/interests'),
  setInterests: (interests) => api.put('/api/users/me/interests', { interests }),
  completeOnboarding: () => api.patch('/api/users/me/onboarding', { completed: true }),
};

export const feedApi = {
  getFeed: (page = 1, limit = 20, topic = null) => {
    const params = { page, limit };
    if (topic) params.topic = topic;
    return api.get('/api/feed', { params });
  },
};

export const articleApi = {
  getById: (id) => api.get(`/api/articles/${id}`),
};

export const interactionApi = {
  record: (articleId, type) => api.post('/api/interactions', { articleId, type }),
};

export const trendingApi = {
  getTopics: (limit = 20) => api.get('/api/trending', { params: { limit } }),
};
