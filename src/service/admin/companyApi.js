import axios from 'axios';
import API_CONFIG from '../apiConfig';

const companyApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/company`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Add request interceptor for auth token
companyApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
companyApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getCompanies = () => companyApi.get('/getCompanyTable');

export const checkCompanyName = (name) => companyApi.get('/check-name', { params: { name } });
export const checkReferenceId = (ref) => companyApi.get('/check-ref', { params: { ref } });
export const createCompany = (data) => companyApi.post('/addCompany', data);
export const updateCompany = (id, data) => companyApi.put(`/updateCompany/${id}`, data);
export const deleteCompany = (id) => companyApi.delete(`/deleteCompany/${id}`);
export const toggleCompanyStatus = (id, status) => companyApi.patch(`/${id}/status`, { status });
// In your React component, use the numeric ID, not company_id
export const toggleBookingStatus = (id, status) => {
  console.log("What bro: ",id, status);
  companyApi.patch(`/booking`, { id, status});
}
export default companyApi;