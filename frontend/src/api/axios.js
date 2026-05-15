import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // required to send and receive refresh token cookies
});

let currentToken = null;

export const setToken = (token) => {
  currentToken = token;
};

api.interceptors.request.use(config => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

export default api;
