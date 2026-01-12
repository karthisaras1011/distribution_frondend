import React, { useState, useEffect } from "react";
import { Edit, X } from "lucide-react";
import Swal from "sweetalert2";
import { caseUpdate } from "../../../service/employee/lrApi";

function CaseSplitUpModal({ isOpen, onClose, data, companyType,onSaveSuccess }) {
  const [electricalFormData, setElectricalFormData] = useState({
    conduit: 0,
    cables: 0,
    others: 0
  });
  
  const [electronicsFormData, setElectronicsFormData] = useState({
    others: 0,
    stabilizer: 0,
    waterHeater: 0
  });
  
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Check company type from company name
  const isElectrical = companyType?.toUpperCase().includes("ELECTRICAL");
  const isElectronics = companyType?.toUpperCase().includes("ELECTRONICS");

  useEffect(() => {
    if (data && isOpen) {
      console.log("Raw data received in modal:", data);
      console.log("Company type:", companyType);
      
      const rawData = data._raw || data;
      
      if (isElectrical) {
        const formData = {
          conduit: parseInt(rawData?.conduit) || 0,
          cables: parseInt(rawData?.cables) || 0,
          others: parseInt(rawData?.others) || 0
        };
        console.log("ELECTRICAL form data:", formData);
        setElectricalFormData(formData);
      } else if (isElectronics) {
        const formData = {
          others: parseInt(rawData?.others) || 0,
          stabilizer: parseInt(rawData?.stabilizer) || 0,
          waterHeater: parseInt(rawData?.water_heater) || 0
        };
        console.log("ELECTRONICS form data:", formData);
        setElectronicsFormData(formData);
      } else {
        // Default to electrical if company type not detected
        const formData = {
          conduit: parseInt(rawData?.conduit) || 0,
          cables: parseInt(rawData?.cables) || 0,
          others: parseInt(rawData?.others) || 0
        };
        console.log("DEFAULT form data:", formData);
        setElectricalFormData(formData);
      }
    }
  }, [data, isOpen, isElectrical, isElectronics]);

  const handleEditClick = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditValue(currentValue.toString());
  };

  const handleEditSave = () => {
    if (editingField && editValue !== "") {
      const newValue = parseInt(editValue) || 0;
      
      if (isElectrical || (!isElectrical && !isElectronics)) {
        setElectricalFormData(prev => ({
          ...prev,
          [editingField]: newValue
        }));
      } else if (isElectronics) {
        setElectronicsFormData(prev => ({
          ...prev,
          [editingField]: newValue
        }));
      }
    }
    setEditingField(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSave = async () => {
    try {
      // Prepare specific data with required fields
      let updateData = {
        reference: data?.reference || data?._raw?.reference || "",
        sales_id: data?.sales_id || data?._raw?.sales_id || "",
              invoiceNo: data?.invoiceNo || data?._raw?.invoiceNo || "",
      companyName: data?.companyName || data?._raw?.companyName || ""
      };

      if (isElectrical || (!isElectrical && !isElectronics)) {
        updateData = {
          ...updateData,
          conduit: electricalFormData.conduit,
          cables: electricalFormData.cables,
          others: electricalFormData.others
        };
      } else if (isElectronics) {
        updateData = {
          ...updateData,
          others: electronicsFormData.others,
          stabilizer: electronicsFormData.stabilizer,
          water_heater: electronicsFormData.waterHeater
        };
      }

      console.log("Saving case split up data:", updateData);

    // ✅ Call the parent's save function instead of direct API call
    if (onSaveSuccess) {
      const response = await onSaveSuccess(updateData);
      console.log("Save successful:", response);
    } else {
      // Fallback to direct API call if parent function not provided
      const response = await caseUpdate(updateData);
      
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Case Split Up data saved successfully!',
          confirmButtonColor: '#842626'
        });
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Failed to save data: ' + (response.message || "Unknown error"),
          confirmButtonColor: '#842626'
        });
      }
    }
  } catch (error) {
    console.error("Error saving case split up data:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Error saving data. Please try again.',
      confirmButtonColor: '#842626'
    });
  }
};
  if (!isOpen || !data) return null;

  // Render input field for both designs
  const renderInputField = (fieldName, label, value) => {
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-200">
        <strong className="text-gray-800 text-lg">{label}:</strong>
        <div className="flex items-center space-x-2">
          {editingField === fieldName ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                autoFocus
                min="0"
              />
              <button
                onClick={handleEditSave}
                className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600"
              >
                ✓
              </button>
              <button
                onClick={handleEditCancel}
                className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 text-lg font-semibold w-8 text-center">{value}</span>
              <button 
                onClick={() => handleEditClick(fieldName, value)}
                className="text-[#842626] hover:text-red-700 transition-colors"
                title={`Edit ${label}`}
              >
                <Edit size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-md">
        {/* Header with Close Button */}
        <div className="bg-[#842626] text-white p-4 rounded-t-lg relative">
          <h2 className="text-xl font-bold text-center">Case Split Up Details</h2>
          <button 
            onClick={onClose}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Company Info */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800 text-lg">COMPANY:</strong>
            </div>
            <p className="text-gray-900 text-lg ml-2">{data.companyName || "N/A"}</p>
          </div>

          {/* Invoice No */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800 text-lg">INVOICE NO:</strong>
            </div>
            <p className="text-gray-900 text-lg font-mono ml-2">{data.invoiceNo || "N/A"}</p>
          </div>

          {/* Case Split Up Inputs */}
          <div className="space-y-2 border-t pt-6">
            {isElectrical || (!isElectrical && !isElectronics) ? (
              /* ELECTRICAL Design - CONDUIT, CABLES, OTHERS */
              <>
                {renderInputField('conduit', 'CONDUIT', electricalFormData.conduit)}
                {renderInputField('cables', 'CABLES', electricalFormData.cables)}
                {renderInputField('others', 'OTHERS', electricalFormData.others)}
              </>
            ) : isElectronics ? (
              /* ELECTRONICS Design - OTHERS, STABILIZER, WATER HEATER */
              <>
                {renderInputField('others', 'OTHERS', electronicsFormData.others)}
                {renderInputField('stabilizer', 'STABILIZER', electronicsFormData.stabilizer)}
                {renderInputField('waterHeater', 'WATER HEATER', electronicsFormData.waterHeater)}
              </>
            ) : null}
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleSave}
              className="w-full px-4 py-3 bg-[#842626] text-white rounded-md hover:bg-red-700 transition-colors font-semibold text-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseSplitUpModal;