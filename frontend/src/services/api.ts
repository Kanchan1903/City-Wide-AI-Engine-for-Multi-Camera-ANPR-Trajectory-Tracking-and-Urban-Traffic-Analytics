import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001',
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('token');
 if (token && config.headers) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 (error) => {
 return Promise.reject(error);
 }
);

// Response interceptor for handling 401s
api.interceptors.response.use(
 (response) => {
 return response;
 },
 (error) => {
 if (error.response && error.response.status === 401) {
 // Clear token and redirect to login if unauthorized
 localStorage.removeItem('token');
 localStorage.removeItem('user');
 window.location.href = '/login';
 }
 return Promise.reject(error);
 }
);

export default api;
