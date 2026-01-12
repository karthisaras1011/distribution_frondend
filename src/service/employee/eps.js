import axios from 'axios';
import API_CONFIG from '../apiConfig';

const ebs = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/ebs`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
ebs.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
ebs.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getEbs = async (params) => {
  try {
    const res = await ebs.get('/getEbsData', { params });
    return res;
  } catch (err) {
    console.error("Error fetching Ebs data:", err);
    throw err;
  }
};

// Add this new function for updating EBS data
export const updateEbs = async (data) => {
  try {
    console.log("📨 Sending update request to backend:", data);
    const res = await ebs.put('/update-ebs-data', data);
    return res;
  } catch (err) {
    console.error("Error updating Ebs data:", err);
    throw err;
  }
};

// Add this new function for deleting EBS data
// export const deleteEbs = async (id) => {
//   try {
//     console.log("des : ",id);
    
//     const res = await ebs.delete(`/delete-ebs-data/${id}`);
//     return res;
//   } catch (err) {
//     console.error("Error deleting Ebs data:", err);
//     throw err;
//   }
// };

export const deleteEbs =(params)=>{
  return ebs.delete('/delete-ebs-data',{
    data:params,
  })

}


// Export to Excel function
export const exportEbsToExcel = async (params) => {
  try {
    console.log("📊 Exporting with params:", params);
    const res = await ebs.get('/get-ebs-export-excel', { 
      params,
      responseType: 'blob' // Important for file download
    });
    return res;
  } catch (err) {
    console.error("Error exporting EBS to Excel:", err);
    throw err;
  }
};