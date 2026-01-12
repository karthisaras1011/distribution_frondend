import axios from 'axios';
import API_CONFIG from '../apiConfig';

const Case = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/case/update`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

Case.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

Case.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getCase = (params = {})=>{
    return Case.get('/get',{params})
}

export const wherhousePerson = ()=>{
    return Case.get('/warehouse')
}

export const updateCase = (sales_id,noOfCases,selectedWarehousePerson)=>{
  return Case.put(`/update?sales_id=${sales_id}`,{
     no_of_boxes:noOfCases, 
      warehouse_id:selectedWarehousePerson, 

  })
}
