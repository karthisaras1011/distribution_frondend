import axios from 'axios';
import API_CONFIG from '../apiConfig';

const inward = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/inward`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
inward.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
inward.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

// ✅ Add the insertCover function
export const insertCover = (data) => {
    console.log("Poiten: ", data);
    
  return inward.post('/cover/insert', data);
};

