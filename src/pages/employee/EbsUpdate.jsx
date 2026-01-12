

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AddMaterialModal from "../../models/employee/BoxUpdate/ebsUpdate";
import { useAuth } from "../../contexts/AuthContext";
import { deleteEbs, getEps } from "../../service/employee/boxUpdate";
import Swal from 'sweetalert2';

const EbsUpdate = () => {
  const location = useLocation();
  const item = location.state?.item;
  const { auth } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // ✅ State to track which action was clicked
  const [actionType, setActionType] = useState('edit');

  // ✅ Set action type when component loads based on navigation state
  useEffect(() => {
    if (item?.action) {
      setActionType(item.action);
    } else {
      setActionType('edit');
    }
  }, [item?.action]);

  // ✅ Determine which buttons to show based on actionType
  const showEditButton = actionType === 'edit';
  const showDeleteButton = actionType === 'delete' || actionType === 'edit';
  const showAddMaterialButton = actionType === 'edit';

  // ✅ Fetch EPS data when component mounts
  useEffect(() => {
    const fetchEpsData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!auth?.company?.id || !item?.customerId || !item?.boxNo) {
          setError("Missing required data to fetch materials");
          setLoading(false);
          return;
        }

        console.log("📥 Fetching EPS data with:", {
          companyId: auth.company.id,
          customerId: item.customerId,
          boxNo: item.boxNo,
          actionType: actionType
        });

        const res = await getEps(auth.company.id, item.customerId, item.boxNo);

        if (res?.data?.success) {
          const epsData = res.data.data || [];
          
          // ✅ Transform backend data to frontend format WITH EBS_ID
          const transformedMaterials = epsData.map(eps => ({
            ebs_id: eps.ebs_id || eps.id, // ✅ Include EBS ID for updates
            batchNo: eps.batch_no || "",
            materialId: eps.material_id || eps.material || "",
            material_id: eps.material_id || "MAT000001",
            materialDescription: eps.description || eps.material_description || "",
            expiryDate: eps.expiry_date || "",
            quantity: eps.qty?.toString() || "1",
            freeQuantity: eps.free_qty?.toString() || "0",
            conditionType: getConditionText(eps.condition_type),
            createdDate: eps.created_date ? new Date(eps.created_date).toLocaleDateString() : new Date().toLocaleDateString()
          }));

          console.log("🔄 Transformed materials:", transformedMaterials);
          setMaterials(transformedMaterials);
        } else {
          setError(res?.data?.message || "Failed to fetch materials");
          setMaterials([]);
        }
      } catch (err) {
        console.error("❌ Error fetching EPS data:", err);
        setError("Failed to load materials. Please try again.");
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEpsData();
  }, [auth?.company?.id, item?.customerId, item?.boxNo, actionType]);

  // ✅ Function to convert numeric condition to text
  const getConditionText = (conditionValue) => {
    const conditionMap = {
      1: "Expiery",
      2: "Breakage",
      3: "Spoiled",
      4: "Salable",
      5: "Short Expiery",
      6: "Long Expiery"
    };
    return conditionMap[conditionValue] || "Select";
  };

  // ✅ Function to convert text condition to numeric (for backend)
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

  // 🔹 Open Add Modal
  const openModal = () => {
    setEditIndex(null);
    setIsModalOpen(true);
  };

  // 🔹 Close Modal
  const closeModal = () => setIsModalOpen(false);

  // 🔹 Save or Update Material
  const handleSaveMaterial = (newMaterial) => {
    const isEdit = editIndex !== null;
    console.log("New Materila: ", newMaterial);
    
    if (isEdit) {
      const updated = [...materials];
      console.log("Edited: ",updated);
      
      updated[editIndex] = newMaterial;
      setMaterials(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Material updated successfully!',
        confirmButtonColor: '#a76c6c',
        timer: 1500
      });
    } else {
      setMaterials([...materials, newMaterial]);
    }
  };

  // ✅ Handle Edit Material
  const handleEdit = (index) => {
    console.log("EditEbs: ", index, materials[index]);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  // ✅ Handle Delete Material with Backend Call
const handleDelete = async (ebs_id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    await deleteEbs( ebs_id);
    await Swal.fire('Deleted!', 'EBS removed successfully.', 'success');
  } catch {
    await Swal.fire('Error!', 'Failed to delete EBS.', 'error');
  }
  refreshData();
};
  // ✅ Refresh data function
  const refreshData = async () => {
    try {
      setLoading(true);
      const res = await getEps(auth.company.id, item.customerId, item.boxNo);

      if (res?.data?.success) {
        const epsData = res.data.data || [];
        const transformedMaterials = epsData.map(eps => ({
          ebs_id: eps.ebs_id || eps.id,
          batchNo: eps.batch_no || "",
          materialId: eps.material_id || eps.material || "",
          material_id: eps.material_id || "MAT000001",
          materialDescription: eps.material_description || eps.description || "",
          expiryDate: eps.expiry_date || "",
          quantity: eps.qty?.toString() || "1",
          freeQuantity: eps.free_qty?.toString() || "0",
          conditionType: getConditionText(eps.condition_type),
          createdDate: eps.created_date ? new Date(eps.created_date).toLocaleDateString() : new Date().toLocaleDateString()
        }));

        setMaterials(transformedMaterials);
        setError("");
      }
    } catch (err) {
      console.error("❌ Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className=" pb-2 mb-4">
        <h1 className="text-xl font-bold text-gray-400">EBS UPDATE</h1>
      </div>

      {/* Box Info */}
      <div className="border border-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="grid grid-cols-3 bg-gray-200 border-b border-gray-800 font-bold">
          <div className="p-2 border-r border-gray-800">BoxNo</div>
          <div className="p-2 border-r border-gray-800">Customer Name</div>
          <div className="p-2">Created Date</div>
        </div>
        <div className="grid grid-cols-3">
          <div className="p-2 border-r border-gray-800">{item?.boxNo}</div>
          <div className="p-2 border-r border-gray-800">{item?.customerName}</div>
          <div className="p-2">{item?.createdDate}</div>
        </div>
      </div>

      {/* Action Mode Indicator
      <div className={`mb-4 p-3 rounded-lg ${
        actionType === 'edit' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-red-50 border border-red-200 text-red-700'
      }`}>
        <p className="text-sm font-medium">
          <strong>Mode:</strong> {actionType === 'edit' ? 'Edit Mode (✏️ and 🗑️ buttons + Add Material visible)' : 'Delete Mode (Only 🗑️ button visible)'}
        </p>
      </div> */}

      {/* Add Material Button and Refresh - Only show in Edit mode */}
      <div className="flex justify-between items-center mb-6">
        {/* Add Material Button - Only show in Edit mode */}
        {showAddMaterialButton && (
          <button
            onClick={openModal}
            className="px-4 py-2 border border-[#6a1a13] rounded-lg bg-[#6a1a13] text-white hover:bg-[#865556] font-medium"
          >
            Add Material
          </button>
        )}
        
        {/* Empty div for spacing when Add Material is hidden */}
        {!showAddMaterialButton && <div></div>}
        
        {/* <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button> */}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading materials...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Table of Materials */}
      {!loading && materials.length > 0 && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="grid grid-cols-10  bg-gray-100 text-gray-600 uppercase text-xs font-semibold border-b  border-gray-300">
            <div className="p-2">S.No</div>
            <div className="p-2">Created</div>
            <div className="p-2">Batch No</div>
            <div className="p-2">Condition</div>
            <div className="p-2">Qty</div>
            <div className="p-2">Free Qty</div>
            <div className="p-2">Material</div>
            <div className="p-2">Description</div>
            <div className="p-2">Expiry</div>
            <div className="p-2 text-center">Action</div>
          </div>

          {materials.map((mat, index) => (
            <div
              key={index}
              className="grid grid-cols-10 text-sm border-t border-gray-200 hover:bg-gray-50"
            >
              <div className="p-2">{index + 1}</div>
              <div className="p-2">{mat.createdDate}</div>
              <div className="p-2">{mat.batchNo}</div>
              <div className="p-2">{mat.conditionType}</div>
              <div className="p-2">{mat.quantity}</div>
              <div className="p-2">{mat.freeQuantity}</div>
              <div className="p-2">{mat.materialId}</div>
              <div className="p-2">{mat.materialDescription}</div>
              <div className="p-2">{mat.expiryDate}</div>
              <div className="p-2 flex justify-center gap-3">
                {/* Edit Button - Show only when in edit mode */}
                {showEditButton && (
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                    title="Edit"
                  >
                    ✏️
                  </button>
                )}
                
                {/* Delete Button - Show in both edit and delete modes */}
                {showDeleteButton && (
                  <button
                    onClick={() => handleDelete(mat.ebs_id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Materials Message */}
      {!loading && materials.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          {actionType === 'edit' 
            ? "No materials found for this box. Click 'Add Material' to get started."
            : "No materials found for this box."
          }
        </div>
      )}

      {/* Modal - Only show in Edit mode */}
      {showAddMaterialButton && (
        <AddMaterialModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveMaterial}
          editData={editIndex !== null ? materials[editIndex] : null}
          companyId={auth?.company?.id}
          boxNo={item?.boxNo}
          customerId={item?.customerId}
          onMaterialAdded={refreshData}
        />
      )}
    </div>
  );
};

export default EbsUpdate;