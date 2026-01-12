import axios from 'axios';
import API_CONFIG from '../apiConfig';

const salable = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/salable`, // Keep as employee/salable
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
salable.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
salable.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getSalable = (params) => {
    console.log('na poren',params);
    
  return salable.get('/getData', { 
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      boxNo: params.boxNo,
      page: params.page,
      limit: params.limit,
      company_id: params.company_id
    }
  });
};

export const exportExcel = (params)=>{
  console.log('📊 Excel Export API Called with params:', params);

  

   const queryParams = {
    // start_date: params.startDate,
    // end_date: params.endDate,
      box_no: params.box_no,
    company_id: params.company_id
  };
   const queryString = new URLSearchParams(queryParams).toString();
  return `${API_CONFIG.BASE_URL}/employee/salable/export/excel?${queryString}`;

}

// PDF export - with better error handling
export const exportPDF = (params) => {
  return salable.get('/export/pdf', {
    params: {
      box_no: params.box_no,
      company_id: params.company_id,
      start_date: params.start_date,
      end_date: params.end_date
    },
    responseType: 'blob',
    timeout: 30000, // 30 seconds timeout
    headers: {
      'Accept': 'application/pdf'
    }
  });
};