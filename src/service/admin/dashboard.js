import axios from 'axios';
import API_CONFIG from '../apiConfig';

const dashboard = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/dashboard`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

dashboard.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

dashboard.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getInwards =()=>{
    return dashboard.get('/cover')
}

export const getReturns =()=>{
    return dashboard.get('/returns')
}

export const getLr =()=>{
    return dashboard.get('/lr')
}

export const getCompanies = ()=>{
  return dashboard.get('/companies')
}

export const getCustomers = ()=>{
  return dashboard.get('/customers')
}

export const getEmployee = ()=>{
  return dashboard.get('/employees')
}