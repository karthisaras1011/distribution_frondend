import axios from 'axios';
import API_CONFIG from '../apiConfig';

const customerApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/customer`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

customerApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

customerApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);
export const getCustomers = (params = {}) => 
  customerApi.get('/getCustomers', { params });

export const updateCustomerStatus = (customerId, status) =>
  customerApi.patch(`/${customerId}/status`, { status });

export const updateAppDeliveryStatus = (customerId, status) =>
  customerApi.patch(`/${customerId}/app-delivery`, { status });

export const deleteCustomer = (customerId) =>
  customerApi.delete(`/deleteCustomer/${customerId}`);

export const getNextCustomerId = () => customerApi.get('/nextCustomerId');

export const createCustomer = (customerData) =>
  customerApi.post('/', customerData);

export const checkCustomerName = (name, customerId = null) => {
  const params = { name };
  if (customerId) params.customerId = customerId;
  return customerApi.get('/check-name', { params });
};

export const updateCustomer = (customerId, customerData) =>
  customerApi.put(`/${customerId}`, customerData);

// Updated exportCustomers function to match your requirements
export const exportCustomers = (company) => {
  return customerApi.get('/export', {
    params: { company },
    responseType: 'blob' // Important for file downloads
  });
};

// New company-related APIs
export const getCustomerCompanies = (customerId) => 
  customerApi.get(`/${customerId}/companies`);

export const searchCompaniesByName = (name) => 
  customerApi.get('/search-companies', { params: { name } });

export const checkUniqueIdExists = (uniqueId,company_name) => 
  customerApi.get('/check-unique-id', { params: { uniqueId,company_name } });

export const addCustomerCompany = (customerId, companyData) =>
  customerApi.post(`/${customerId}/companies`, companyData);

export const removeCustomerCompany = (customerId, uniqueId) =>
  customerApi.delete(`/${customerId}/companies/${uniqueId}`);

export const getCompanies = () => {
  return customerApi.get('/companies');
};

// Assumes file is a real File object
export const bulkUpdateCustomers = (file, onUploadProgress) => {
 
  return customerApi.post('/bulk-update', file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 600000,
    onUploadProgress,
  });
};

export const getRoutes=()=>{
 return customerApi.get('/get/routes')
}


export const bulkInsertCustomer =(file,onUploadProgress)=>{
  return customerApi.post('/bulk/insert/update',file,{

    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 600000,
    onUploadProgress,
  })

}