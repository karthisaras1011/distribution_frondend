import axios from 'axios';
import API_CONFIG from '../apiConfig';

const returns = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/return`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  timeout: 30000,
});

// Request interceptor
returns.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
returns.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

// ✅ Update return with company_id
export const updateReturn = async (data) => {
  try {
    const res = await returns.post('/insert', data);
    return res.data;
  } catch (err) {
    console.error('Update Return error:', err);
    throw err;
  }
};



// ✅ Get customers by company_id
export const getCompanyByCustomer = async (companyId) => {
  try {
    const res = await returns.get(`/customers?company_id=${companyId}`);
    return res.data;
  } catch (err) {
    console.error('Get Company Customers error:', err);
    throw err;
  }
};

export default returns;

export const getBoxNo = async(companyId)=>{
try{
  const res = await returns.get(`/boxno?company_id=${companyId}`);
  return res.data
}catch (err){
  console.log("Get Box No Error:",err);
  throw err;

}
};

export const getTransport = async()=>{
try{
  const res = await returns.get('/transport');  
  return res.data

}catch (err){
  console.log("Get Transport Error:",err);
  throw err;
  

}
}