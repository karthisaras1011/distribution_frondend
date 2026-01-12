import React, { useState, useEffect } from "react";
import { salesBatch, insertSales, updateSalable} from "../../../service/employee/boxUpdate";
import Swal from 'sweetalert2';
import { useAuth } from "../../../contexts/AuthContext";

const SalableModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editData, 
  companyId, 
  boxNo, 
  customerId, 
  onMaterialAdded 
}) => {
  const [batchNo, setBatchNo] = useState(editData?.batchNo || "");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchOptions, setShowBatchOptions] = useState(false);
  const [showDetails, setShowDetails] = useState(!!editData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { auth } = useAuth();
  
  const [form, setForm] = useState(
    editData || {
      materialId: "",
      material_id: "",
      materialDescription: "",                                                                                                    
      expiryDate: "",
      quantity: "",
      freeQuantity: "",
      conditionType: "Select",
    }
  );

  // ✅ Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setBatchNo(editData.batchNo);
        setSelectedBatch(editData);
        setShowDetails(true);
        setForm(editData);
      } else {
        setBatchNo("");
        setBatches([]);
        setSelectedBatch(null);
        setShowBatchOptions(false);
        setShowDetails(false);
        setForm({
          materialId: "",
          material_id: "",
          materialDescription: "",
          expiryDate: "",
          quantity: "",
          freeQuantity: "",
          conditionType: "Select",
        });
      }
      setError("");
    }
  }, [editData, isOpen]);

  // Function to convert condition text to numeric value
  const getConditionValue = (conditionText) => {
    const conditionMap = {
      "Expiery": 1,
      "Breakage": 2,
      "Spoiled": 3,
      "Salable": 4,
      "Short Expiery": 5,
      "Long Expiery": 6
    };
    return conditionMap[conditionText] || 0;
  };

  // Function to show "Already Exists" in orange color
  const showAlreadyExistsAlert = (materialData) => {
    return Swal.fire({
      icon: 'warning',
      title: 'Already Exists!',
      html: `
        <div style="text-align: center;">
          <div style="color: #ff9800; font-size: 48px; margin-bottom: 15px;">
            ⚠️
          </div>
          <p style="font-weight: bold; margin-bottom: 15px; color: #ff9800;">
            This material already exists in the system!
          </p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <p style="margin: 5px 0; color: #856404;"><strong>Material:</strong> ${materialData.materialId}</p>
            <p style="margin: 5px 0; color: #856404;"><strong>Description:</strong> ${materialData.materialDescription}</p>
            <p style="margin: 5px 0; color: #856404;"><strong>Batch No:</strong> ${materialData.batchNo}</p>
            <p style="margin: 5px 0; color: #856404;"><strong>Box No:</strong> ${boxNo}</p>
          </div>
          <p style="margin-top: 15px; color: #666; font-size: 14px;">
            Please check the materials list or use a different batch number.
          </p>
        </div>
      `,
      confirmButtonColor: '#ff9800',
      confirmButtonText: 'Understand',
      showCancelButton: true,
      cancelButtonText: 'View List',
      cancelButtonColor: '#a76c6c',
      background: '#fffaf0',
      customClass: {
        popup: 'orange-alert-popup'
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleGetBatches = async () => {
    if (!batchNo.trim()) {
      setError("Please enter a batch number");
      return;
    }

    if (!companyId) {
      setError("Company ID not found");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await salesBatch(companyId, batchNo);
      console.log("I'm batch res: ", res);
      
      if (res?.data?.success) {
        const batchesData = res.data.data;
        
        if (Array.isArray(batchesData)) {
          if (batchesData.length === 0) {
            setError("No batches found for this batch number");
            return;
          }
          setBatches(batchesData);
          setShowBatchOptions(true);
        } else {
          // Single batch result
          const batchData = batchesData;
          handleBatchSelect(batchData);
        }
      } else {
        setError(res?.data?.message || "No batches found");
      }
    } catch (err) {
      console.error("❌ Error fetching batches:", err);
      
      let errorMessage = "Unexpected error occurred";
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Network error: Unable to connect to server";
      }

      await Swal.fire({
        icon: 'error',
        title: 'Connection Error!',
        text: errorMessage,
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = (batch) => {
    console.log("✅ Selected batch:", batch);
    
    const materialData = {
      materialId: batch.material || batch.material_id || "",
      material_id: batch.material_id || "MAT000001",
      materialDescription: batch.description || batch.material_description || "",
      expiryDate: batch.expiry_date || "",
      quantity: "1",
      freeQuantity: "0",
      conditionType: "Select",
    };

    setSelectedBatch(batch);
    setForm(materialData);
    setShowBatchOptions(false);
    setShowDetails(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!form.materialId || !form.quantity || form.conditionType === "Select") {
      setError("Please fill all required fields");
      return;
    }

    if (isNaN(form.quantity) || parseInt(form.quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    // Check if customerId is available
    if (!customerId) {
      setError("Customer ID is missing. Please go back and try again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Convert condition text to numeric value
      const conditionNumericValue = getConditionValue(form.conditionType);
      console.log('Form data:', form);

      // ✅ PREPARE DATA FOR BOTH INSERT AND UPDATE
      const epsData = {
        material_id: form.material_id || selectedBatch?.material_id || "MAT000001",
        customer_id: customerId,
        company_id: companyId,
        condition_type: conditionNumericValue,
        qty: parseInt(form.quantity),
        free_qty: parseInt(form.freeQuantity) || 0,
        box_no: boxNo,
        salable: 1, // ✅ Always set salable to 1 for both add and edit operations
        batch_no: selectedBatch?.batch_no || batchNo,
        material_description: form.materialDescription,
        expiry_date: form.expiryDate,
        created_employee: auth.userName,
        material: form.materialId
      };

      // ✅ ADD EBS_ID FOR UPDATE OPERATION
      if (editData && editData.ebs_id) {
        epsData.ebs_id = editData.ebs_id;
      }

      console.log("📤 Sending EPS data to backend:", epsData);

      let res;
      
      // ✅ DECIDE WHETHER TO INSERT OR UPDATE
      if (editData) {
        console.log('Updating existing material...');
        res = await updateSalable(epsData);
      } else {
        console.log('Adding new material with salable: 1...');
        res = await insertSales(epsData);
      }

      if (res?.data?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: editData ? 'Material updated successfully!' : 'Material added successfully!',
          confirmButtonColor: '#a76c6c',
          confirmButtonText: 'OK',
          timer: 2000
        });

        // Update local state for UI
        const materialData = { 
          batchNo: selectedBatch?.batch_no || batchNo,
          ...form,
          conditionType: form.conditionType,
          // ✅ PRESERVE EBS_ID FOR FUTURE UPDATES
          ebs_id: editData?.ebs_id || res.data.data?.ebs_id,
          salable: 1 // ✅ Ensure salable is set in local state too
        };
        
        console.log("💾 Saving material data locally:", materialData);
        onSave(materialData);
        
        // Call the refresh function if provided
        if (onMaterialAdded) {
          onMaterialAdded();
        }
        
        onClose();
      } else {
        // Check if it's a duplicate entry error
        const errorMessage = res?.data?.message || "Failed to save material";
        
        if (errorMessage.includes("Duplicate entry") || errorMessage.includes("already exists")) {
          // Show orange "Already Exists" alert
          await showAlreadyExistsAlert({
            materialId: form.materialId,
            materialDescription: form.materialDescription,
            batchNo: selectedBatch?.batch_no || batchNo
          });
        } else {
          // Other errors - show normal error alert
          await Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: errorMessage,
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error("❌ Error saving EPS data:", err);
      
      let errorMessage = editData ? "Failed to update material" : "Failed to save material. Please try again.";
      
      // Handle different types of errors
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        
        // Check if it's a duplicate entry in catch block too
        if (errorMessage.includes("Duplicate entry") || errorMessage.includes("already exists")) {
          await showAlreadyExistsAlert({
            materialId: form.materialId,
            materialDescription: form.materialDescription,
            batchNo: selectedBatch?.batch_no || batchNo
          });
          return;
        }
      } else if (err.request) {
        errorMessage = "Network error: Unable to connect to server";
        
        // Show normal error for network issues
        await Swal.fire({
          icon: 'error',
          title: 'Connection Error!',
          text: errorMessage,
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      } else {
        // Other errors
        await Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorMessage,
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? "Edit Material" : "Add Material"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Batch Input Section */}
        <div className="space-y-2 mb-4">
          <label className="block text-sm font-semibold text-gray-700 tracking-wide">
            BATCH NO
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleGetBatches()}
              className="flex-1 border border-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#a76c6c]"
              readOnly={!!editData}
              placeholder="Enter batch number"
              disabled={loading}
            />
            {!editData && (
              <button
                onClick={handleGetBatches}
                disabled={loading || !batchNo.trim()}
                className="bg-[#6a1a13] hover:bg-[#865556] text-white text-sm font-medium px-4 py-2 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Get Details"}
              </button>
            )}
          </div>
        </div>

        {/* Material Description Button */}
        {selectedBatch && !showDetails && !editData && (
          <button
            onClick={() => setShowDetails(true)}
            className="w-full mb-4 p-3 border border-gray-400 text-gray-700 hover:bg-gray-50 font-medium rounded transition-all duration-200 text-left"
          >
            {form.materialDescription}
          </button>
        )}

        {/* Batch Options List */}
        {showBatchOptions && batches.length > 0 && (
          <div className="mb-4 border border-gray-300 rounded max-h-60 overflow-y-auto">
            <div className="bg-gray-100 p-3 border-b border-gray-300">
              <h3 className="text-sm font-semibold text-gray-700">
                Select Batch ({batches.length} found)
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {batches.map((batch, index) => (
                <button
                  key={index}
                  onClick={() => handleBatchSelect(batch)}
                  className="w-full p-3 text-left hover:bg-rose-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {batch.description || batch.material_description}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Batch: <span className="font-mono">{batch.batch_no}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        Expiry: {batch.expiry_date}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Material Details Form */}
        {showDetails && (
          <div className="space-y-4">
            {/* Material ID & Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  MATERIAL ID
                </label>
                <input
                  type="text"
                  name="materialId"
                  value={form.materialId}
                  onChange={handleChange}
                  readOnly
                  className="w-full border border-gray-400 focus:outline-[#6a1a13]  rounded px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  MATERIAL DESCRIPTION
                </label>
                <input
                  type="text"
                  name="materialDescription"
                  value={form.materialDescription}
                  onChange={handleChange}
                  readOnly
                  className="w-full border border-gray-400 rounded focus:outline-[#6a1a13] px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Expiry Date & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  EXPIRY DATE
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full border border-gray-400 rounded focus:outline-[#6a1a13]  px-3 py-2 text-sm focus:border-[#a76c6c]"
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  QUANTITY
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:outline-[#6a1a13] focus:border-[#a76c6c]"
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            {/* Free Quantity & Condition Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  FREE QUANTITY
                </label>
                <input
                  type="number"
                  name="freeQuantity"
                  value={form.freeQuantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:outline-[#6a1a13] focus:border-[#a76c6c]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  CONDITION TYPE
                </label>
                <select
                  name="conditionType"
                  value={form.conditionType}
                  onChange={handleChange}
                  className="w-full border border-gray-400 rounded px-3 py-2 text-sm focus:outline-[#6a1a13]  focus:border-[#a76c6c] bg-white"
                >
                  <option value="Select">Select one</option>
                  <option value="Expiery">Expiery</option>
                  <option value="Breakage">Breakage</option>
                  <option value="Spoiled">Spoiled</option>
                  <option value="Salable">Salable</option>
                  <option value="Short Expiery">Short Expiery</option>
                  <option value="Long Expiery">Long Expiery</option>
                </select>
              </div>
            </div>

            {/* Add/Update Material Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#6a1a13] hover:bg-[#865556] text-white font-medium px-4 py-3 rounded transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Saving..." : (editData ? "Update Material" : "Add Material")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalableModal;