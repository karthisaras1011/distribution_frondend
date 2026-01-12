import axios from 'axios';
import API_CONFIG from '../apiConfig';

const loginCompany = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/companies-login`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
loginCompany.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
loginCompany.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getLoginCompanies = () => {
  return loginCompany.get('/getCompanyTable');
};