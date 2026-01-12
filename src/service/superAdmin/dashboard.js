import axios from 'axios';
import API_CONFIG from '../apiConfig';

const DashBoard = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/super-admin`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
DashBoard.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
DashBoard.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getCompany = () => {
  return DashBoard.get('/dashboard-company');
};
export const getCustomer = () => {
  return DashBoard.get('/dashboard-customer');
};

export const getSales = () => {
  return DashBoard.get('/dashboard-sales');
};
export const getRecentYearSales = () => {
  return DashBoard.get('/dashboard-recentYear-sales');
};
// export const getCompanySales = (company) => {
//   return DashBoard.post('/dashboard-company-sales',{data:company});
// };
