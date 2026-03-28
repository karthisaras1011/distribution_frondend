import axios from 'axios';
import API_CONFIG from '../apiConfig';

const lr = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/admin/lrupdate`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

lr.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

lr.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);
export const getLRData = (params = {}) => {
  return lr.get('/get/lr', { params });
};

export const currentExport = (params) => {
  console.log("na poren", params);
  
  // Map frontend parameter names to backend expected names
  const backendParams = {
    page: params.page,
    limit: params.limit,
    companyId: params.company_id, // Map company_id → companyId
    startDate: params.start_date, // Map start_date → startDate
    endDate: params.end_date,     // Map end_date → endDate
    search: params.search || params.lr_no || params.courier_no || params.invoice_no || params.cheque_no || params.customer_name,
  };
  
  // Remove undefined values
  Object.keys(backendParams).forEach(key => {
    if (backendParams[key] === undefined || backendParams[key] === '') {
      delete backendParams[key];
    }
  });
  
  const queryString = new URLSearchParams(backendParams).toString();
  return `${API_CONFIG.BASE_URL}/admin/lrupdate/current/export?${queryString}`;
}
export const exportAll = (params)=>{
     const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/admin/lrupdate/full/export?${queryString}`;

}

// In your lr.js API service file
export const editLr = (salesId, updateData) => {
  console.log("📡 Sending to API - salesId:", salesId, "updateData:", updateData);
  return lr.put(`/update`, { 
    sales_id: salesId, 
    ...updateData 
  });
};

export const deleteLr = (salesId) => {
  console.log('na poren',salesId);
  
  return lr.delete(`/delete`, { 
    data: { sales_id:salesId } // Send salesId in request body for DELETE
  });
};
