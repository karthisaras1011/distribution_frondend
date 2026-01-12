import axios from 'axios';
import API_CONFIG from '../apiConfig';

const materialApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/materials`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

materialApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

materialApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

// Get materials data with pagination
export const getMaterials = async (page = 1, limit = 50, search = '') => {
  try {
    const params = { page, limit };
    if (search && search.trim() !== '') {
      params.search = search.trim();
    }
    const response = await materialApi.get('/get/data', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload materials file
export const uploadMaterials = async (formData) => {
  try {

    const response = await materialApi.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log("Res:::: ",response);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Export all materials report
export const exportMaterials = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/admin/materials/exportAll?${queryString}`;
};

// ✅ Export Company Report with company_id
export const exportCompany = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/admin/materials/search/export?${queryString}`;
};

export default materialApi;
