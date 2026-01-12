import axios from 'axios';
import API_CONFIG from '../apiConfig';

const inwart = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/inward/cover`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

inwart.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

inwart.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

// ✅ Get Inward Cover report
export const getInward = async (params) => {
  try {
    const response = await inwart.get('/get', { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching inward cover report:", error);
    throw error;
  }
};

export const currentExport = (params)=>{
     const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/admin/inward/cover/export/current?${queryString}`;

}

export const currentExportAll = (params)=>{
     const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/admin/inward/cover/export/all?${queryString}`;

}

// In src/service/admin/inward.js
export const deleteInward = (params) => {
  console.log("Delete params:", params);
  return inwart.delete('/delete', 
    { params } );
};

export const updateInward = (data)=>{
  console.log("na poren",data);
  
      return inwart.put('/update',data)
}