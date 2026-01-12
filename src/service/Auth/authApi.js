import axios from 'axios';
import API_CONFIG from '../apiConfig';

const authApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/auth`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
authApi.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
authApi.interceptors.response.use(
  response => {
    // You can transform response data here if needed
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const loginApi = (credentials) => {
  return authApi.post('/login', credentials);
};

export const logoutApi = () => {
  return authApi.post('/logout');
};

export const checkAuthApi = () => {
  return authApi.get('/user-type');
};

export const setCompanyApi = (companyId) => {
  return authApi.post('/set-company', { companyId });
};

export const clearCompanyApi = () => {
  return authApi.post('/clear-company');
};

export const getCompanyApi = ( ) => {
  return authApi.get('/company');
};