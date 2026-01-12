import axios from 'axios';
import API_CONFIG from '../apiConfig';

const box = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/employee/box_update`,
  withCredentials: API_CONFIG.WITH_CREDENTIALS
});

// Request interceptor
box.interceptors.request.use(config => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
box.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const getBox = async (params) => {
  try {
    console.log("Api pothu: ", params);
    const res = await box.get('/get', { params });
    console.log("Nan vanten: ", res);
    return res;
  } catch (err) {
    console.error("Error fetching Ebs data:", err);
    throw err;
  }
};

// ✅ COMPLETE UPDATE FUNCTION
export const updateBox = async (data) => {
  try {
    console.log("📤 Updating box data:", data);
    const res = await box.put('/update', data);
    console.log("✅ Update response:", res);
    return res;
  } catch (err) {
    console.error("❌ Error updating box data:", err);
    throw err;
  }
};
export const insertCredit = async (data) => {
  try {
    console.log("📤 Insert Credit data:", data);
    const res = await box.post('/insert/credit', data);
    console.log("✅ Insert response:", res);
    return res;
  } catch (err) {
    console.error("❌ Error Inserting data:", err);
    throw err;
  }
};

export const deleteBox = async (id) => {
  try {
    const res = await box.delete("/delete", { data: { return_id: id } });
    return res;
  } catch (err) {
    console.error("❌ Error deleting box:", err);
    throw err;
  }
};


// service/employee/boxUpdate.js

export const searchBatch = async (companyId, batchNo) => {
  try {
    console.log("🔍 Searching batch:", { company_id: companyId, batch_no: batchNo });
    
    const res = await box.get('/batch/search', {
      params: {  // ✅ Use params object for query parameters
        company_id: companyId,
        batch_no: batchNo
      }
    });
    
    console.log("✅ Batch search response:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Error searching batch:", err);
    throw err;
  }
};

export const salesBatch = async(companyId,batchNo)=>{

  try{
    const res = await box.get('/batch/search',{
      params :{
        company_id:companyId,
        batch_no:batchNo
      }
    })
    return res;
  }catch(err){
    throw err;
  }
}

// service/employee/boxUpdate.js

export const insertEps = async (data) => {
  try {
    console.log("📤 Inserting EPS data:", data);
    const res = await box.post('/insert/ebs', data);
    console.log("✅ EPS insert response:", res);
    return res;
  } catch (err) {
    console.error("❌ Error inserting EPS data:", err);
    throw err;
  }
};  

// service/employee/boxUpdate.js

export const getEps = async (companyId, customerId, boxNo) => {
  try {
    console.log("🔍 Getting EPS data:", { company_id: companyId, customer_id: customerId, box_no: boxNo });
    
    const res = await box.get('/get/ebs', {
      params: {
        company_id: companyId,
        customer_id: customerId,
        box_no: boxNo,
        salable: 0 // ✅ Always send salable=0 for EBS
      }
    });
    
    console.log("✅ EPS data response:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Error getting EPS data:", err);
    throw err;
  }
};

export const updateEbs = async (data) => {
  try {
    console.log("📤 Updating EBS data:", data);
    const res = await box.put('/update/ebs', data);
    console.log("✅ EBS update response:", res);
    return res;
  } catch (err) {
    console.error("❌ Error updating EBS data:", err);
    throw err;
  }
};

export const deleteEbs = async (id) => {
  try {
    const res = await box.delete("/delete/ebs", { data: { ebs_id: id } });
    return res;
  } catch (err) {
    console.error("❌ Error deleting box:", err);
    throw err;
  }
};

export const insertSales = async (data) => {
  try {
    console.log("📤 Inserting SALABLE data:", data);
    const res = await box.post('/insert/salable', data);
    console.log("✅ Sales insert response:", res);
    return res;
  } catch (err) {
    console.error("❌ Error inserting Sales data:", err);
    throw err;
  }
}

export const getSalable = async (companyId, customerId, boxNo) => {
  try {
    console.log("🔍 Getting EPS data:", { company_id: companyId, customer_id: customerId, box_no: boxNo });
    
    const res = await box.get('/get/salable', {
      params: {
        company_id: companyId,
        customer_id: customerId,
        box_no: boxNo,
        salable: 1 // ✅ Always send salable=0 for EBS
      }
    });
    
    console.log("✅ EPS data response:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Error getting EPS data:", err);
    throw err;
  }
};

export const updateSalable = async (data) => {
  try {
    console.log("📤 Updating EBS data:", data);
    const res = await box.put('/update/salable', data);
    console.log("✅ EBS update response:", res);
    return res;
  } catch (err) {
    console.error("❌ Error updating EBS data:", err);
    throw err;
  }
};

export const deleteSalable = async (id) => {
  try {
    const res = await box.delete("/delete/salable", { data: { ebs_id: id } });
    return res;
  } catch (err) {
    console.error("❌ Error deleting box:", err);
    throw err;
  }
};

export const exportCurrent = (params)=>{
   const queryString = new URLSearchParams(params).toString();
  return `${API_CONFIG.BASE_URL}/employee/box_update/export/box?${queryString}`;

}