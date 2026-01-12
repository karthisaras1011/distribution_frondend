import axios from 'axios';
import API_CONFIG from '../apiConfig';

const employee = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/manage/employees`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

employee.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

employee.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getEmployees = (params = {}) => {
  return employee.get('/get', { params });
};

export const addEmployee = (data) => {
  return employee.post('/insert', data);
};

export const updateEmployee = (data) => {
  console.log('Updating employee:', data);
  return employee.put('/update', data);
};

export const deleteEmployee = (no_of_data, employee_id) => {
  return employee.delete('/delete', {
    data: { no_of_data, employee_id }
  });
};

export const statusEmployee = (data) => {
  console.log('Sending status data:', data);
  return employee.put('/status', data);
};

// Add this function to your existing API exports
export const shipmentStatuss = (data) => {
  console.log('Sending shipment status data:', data);
  return employee.put('/shipment/status', data);
};