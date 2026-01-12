import axios from 'axios';
import API_CONFIG from '../apiConfig';

const returnsApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/returns`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

returnsApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

returnsApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getReturns = (params = {}) => {
  return returnsApi.get('/get-data', { params });
};

export const getExportCurrent = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/admin/returns/export/current?${queryString}`;
};

export const getExportAll = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/admin/returns/export/all?${queryString}`;
};

export const deleteReturn = (params) => {
  return returnsApi.delete('/delete', {
    data: params,
  });
};

export const updateReturn = (data) => {
  return returnsApi.put('/update', data);
};

export const insertCredit = (data) => {
  console.log("Varen credit: ", data);
  return returnsApi.post('/insert/credit', data);
};

export const deleteCredit = (data) => {
  return returnsApi.delete('/delete/credit', {
    data: data,
  });
};