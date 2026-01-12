// service/employee/sales.js
import axios from 'axios';
import API_CONFIG from '../apiConfig';

const sales = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/sales`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  timeout: 30000 // 30 second timeout for large datasets
});

// Request interceptor
sales.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
sales.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getInvoiceData = (companyId, page = 1, limit = 200, startDate = '', endDate = '', search = '') => {
  const params = new URLSearchParams({
    companyId,
    page,
    limit,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(search && { search })
  });
  
  return sales.get(`/getInvoiceData?${params}`);
}

 export const deleteInvoice = (company_id, invoice_no, invoice_date) => {
  return sales.delete('/deleteInvoice', {
    data: { company_id, invoice_no, invoice_date }
  });
};
export const AddSales = (salesData,user) => {
  return sales.post('/add-sales', {
    data: { salesData,user }
  });
};
