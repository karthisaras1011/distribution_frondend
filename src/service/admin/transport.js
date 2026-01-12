import axios from 'axios';
import API_CONFIG from '../apiConfig';

const transport = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/transport`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

transport.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

transport.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

// GET transport function
export const getTransport = (params = {}) => {
  return transport.get('/get', { params });
};

// EDIT transport function - now accepts complete data object
export const editTransport = (data) => {
  return transport.put('/update', data); // URL path change to match your backend
};

// ADD transport function
export const addTransport = (data) => {
  return transport.post('/insert', data);
};

// DELETE transport function
export const deleteTransport = (no_of_data) => {
  return transport.delete('/delete', {
    data: { no_of_data } // Request body la no_of_data poganum
  });
};