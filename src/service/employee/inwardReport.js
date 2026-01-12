import axios from 'axios';
import API_CONFIG from '../apiConfig';

const report = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/inward/cover`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  timeout: 30000,
});

// Request interceptor
report.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
report.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getInwardReport =(params)=>{
    return report.get('/get',{params })
    
}

export const currentExport =(params)=>{
  console.log("API inside : ",params);
  
     const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/employee/inward/cover/export/current?${queryString}`;

}

export const currentExportAll =(params)=>{
     const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/employee/inward/cover/export/all?${queryString}`;

}