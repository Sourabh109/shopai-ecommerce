import axios from 'axios';

// Hardcoded Railway URL — no env var dependency
const API_URL = 'https://shopai-ecommerce-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials removed — we use Bearer tokens in Authorization header, not cookies
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 - try refresh then redirect
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        const msg = error.response?.data?.message || error.message || 'Session expired';
        console.error(msg);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
