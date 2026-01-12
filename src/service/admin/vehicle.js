import axios from 'axios';
import API_CONFIG from '../apiConfig';

const vehicle = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/vehicle`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

vehicle.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

vehicle.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getVehicle=(params)=>{
    return vehicle.get('/get',{params})
}

export const insertVihicle=(data)=>{
    return vehicle.post('/insert',data)
}

export const updateVehicle =(data)=>{
    return vehicle.put('/update',data)
}
export const deleteVehicle =(id)=>{
    return vehicle.delete('/delete',{
        data:{id}
    })
}