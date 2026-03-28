import axios from 'axios';
import API_CONFIG from '../apiConfig';
import { data } from 'react-router-dom';

const lr = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/lrupdate`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  timeout: 30000,
});

// Request interceptor
lr.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
lr.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getLrData = async (params) => {
  try {
    console.log("hi Dude: ",params);
    
    const res = await lr.get('/getLrUpdateData', { params });
    return res;
  } catch (err) {
    console.error("Error fetching LR data:", err);
    throw err;
  }
};



// Export functions - return the full URL with parameters
export const getExportCurrentUrl = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/employee/lrupdate/get-lr-currentpage-export?${queryString}`;
};

export const getExportFullUrl = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/employee/lrupdate/get-lr-full-export?${queryString}`;
};

export const deleteLr =(params)=>{
  return lr.delete('/delete-lrpdate',{
    data:params,
  })

}

export const updateLr=async(data)=>{
  try{
    const res = await lr.put('/update-lrupdate-data',data)
    
    res.data
  }catch (err) {
      console.log("Update Lr error:",err);
      throw err;
      
  }

}

export const caseUpdate = async (data) => {
  console.log('na poren',data);
  
  try {
    const res = await lr.put('/case/update', data);
    return res.data;
  } catch (err) {
    console.error("Case Update error:", err);
    throw err;
  }
};

export const clubInvoiceLr = async (clubbingData) => {
  try {
    const { companyId, customerId, selectedItems, clubedBoxes } = clubbingData;
    
    // Extract sales_id from _raw data
    const salesIds = selectedItems.map(item => {
      const salesId = item._raw?.sales_id;
      if (!salesId) {
        throw new Error(`sales_id not found for invoice: ${item.invoiceNo}`);
      }
      return salesId;
    });

    // Extract invoice numbers
    const invoiceNos = selectedItems.map(item => item.invoiceNo);

    // Prepare data for API
    const requestData = {
      company_id: companyId,
      customer_id: customerId,
      salesIds: salesIds, // Actual sales_id from database
      invoiceNos: invoiceNos,
      clubed_box_no: parseInt(clubedBoxes) || 0
    };

    console.log("✅ Clubbing API Request:", requestData);

    const res = await lr.put('/club', requestData);
    return res.data;
  } catch (err) {
    console.error("❌ Clubbing API error:", err);
    throw err;
  }
};

export const deleteClub = async (referenceNo) => {
  try {
    const res = await lr.delete('/club/delete', {
      data: { reference_no: referenceNo }
    });
    return res.data;
  } catch (err) {
    console.error("❌ Delete Club error:", err);
    throw err;
  }
};