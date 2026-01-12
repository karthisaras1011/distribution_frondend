import axios from 'axios';
import API_CONFIG from '../apiConfig';

const reports = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/return`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  timeout: 30000,
});

// Request interceptor
reports.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
reports.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const returnsReport = async (params) => {
  try {
    console.log("API Request Params:", params);
    const response = await reports.get('/get-data', { params });
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Call Failed:", error);
    throw error;
  }
};

export const exportCurrnt = (params)=>{
  const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/employee/return/export/current?${queryString}`;
}

export const exportAll =(params)=>{
  const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/employee/return/export/all?${queryString}`;
}