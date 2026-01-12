import axios from 'axios';
import API_CONFIG from '../apiConfig';

const details = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/employee`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

details.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

details.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);
export const getDetails = (params)=>{
    return details.get('/get',{params})
}

export const insertDetails = (data)=>{
    return details.post('/insert',data)
}
export const updateDetails = (data)=>{
    return details.put('/update',data)
}

export const deleteDetails =(id)=>{
    return details.delete('/delete',{
        data:{id}
    })
}

export const statusDetails=(data)=>{
    return details.put('/status',data)
}

export const getDesigination = ()=>{
  return details.get('/get/desig')
}

export const insertDesigination = (data) => {
  return details.post('/insert/desig', data)
}

export const updateDesigination = (data) => {
  return details.put('/update/desig', data)
}

export const deleteDesigination = (id) => {
  console.log('na poren',id);
  
  return details.delete(`/delete/desig`,{data:{id}}) 
}