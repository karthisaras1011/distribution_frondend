import axios from 'axios';
import { data } from 'react-router-dom';
import API_CONFIG from '../apiConfig';
// import API_CONFIG from '../../../service/apiConfig';

const Routing = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/routes`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
Routing.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
Routing.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const CreateRouteApi = (route_data) => {
  return Routing.post('/add-routes',{data:route_data});
};
export const UpdateRouteApi = (route_data) => {
  return Routing.patch('/edit-routes',{data:route_data});
};
export const DeleteRouteApi = (route_data) => {
  return Routing.patch('/delete-routes',{data:route_data});
};
export const getRouteApi = (route_data) => {
  return Routing.get('/get-routes');
};
// export const getCompanySales = (company) => {
//   return DashBoard.post('/dashboard-company-sales',{data:company});
// };
