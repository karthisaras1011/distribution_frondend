import axios from 'axios';
import API_CONFIG from '../apiConfig';

const invoice = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/missing`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
invoice.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
invoice.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getMissingInvoices = (params) => {
  console.log('na poren',params);
  
  return invoice.get('/invoices/get', { params });
};