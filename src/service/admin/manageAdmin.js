import axios from 'axios';
import API_CONFIG from '../apiConfig';

const manage = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/manage/admin`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

manage.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

manage.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getManage =(params ={})=>{
     return manage.get('/get',{params})
}

export const addAdmins = (data)=>{
     return manage.post('/insert',data)
}
export const updateAdmins = (data)=>{
  console.log('na poren',data);
  
     return manage.put('/update',data)
}
export const deleteAdmins = (no_of_data,admin_id) => {
  return manage.delete('/delete', {
    data: { no_of_data,admin_id } // Request body la no_of_data poganum
  });
};
export const statusAdmins = (data) => {
  console.log('Sending status data:', data);
  return manage.put('/status', data);
};