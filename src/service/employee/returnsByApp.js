import axios from 'axios';
import API_CONFIG from '../apiConfig';

const returnsByApp = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/returns/byapp`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  timeout: 30000,
});

// Request interceptor
returnsByApp.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
returnsByApp.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getReturnsByApp = async (params) => {
  try {
    const res = await returnsByApp.get('/get', { params });
    return res.data;
  } catch (err) {
    console.log("Get Returns By App Error:", err);
    throw err;
  }
};

// Add the update API function
export const updateReturnApproval = async (returnId, approvalData) => {
  try {
    console.log("API Check: ",returnId, approvalData);
    
    const res = await returnsByApp.put(`/update/${returnId}`, approvalData);
    return res.data;
  } catch (err) {
    console.log("Update Return Approval Error:", err);
    throw err;
  }
};