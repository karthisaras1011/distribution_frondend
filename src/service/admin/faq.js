import axios from 'axios';
import API_CONFIG from '../apiConfig';

const faq = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/faq`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

faq.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

faq.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

// ✅ multipart/form-data send pannum
export const insertIssue = async (formData) => {
  const response = await faq.post('/insert', formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getAllIssues = async () => {
  const response = await faq.get('/issues');
  console.log("RRReeesss: ",response);
  
  return response.data;
};

export const deleteIssue = async (id) => {
  const response = await faq.delete(`/issues/${id}`);
  return response.data;
};

export const updateIssue = async (id, formData) => {
  const response = await faq.put(`/issues/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};