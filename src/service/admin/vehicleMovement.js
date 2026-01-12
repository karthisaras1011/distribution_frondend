import axios from 'axios';
import API_CONFIG from '../apiConfig';

const vmovement = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/movements`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

vmovement.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

vmovement.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getVehicleMovement = (params = {}) => {
    console.log('API Params:', params);
    return vmovement.get('/get', { params });
}