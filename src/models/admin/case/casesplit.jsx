import React, { useState, useEffect } from "react";
import { Edit, X } from "lucide-react";
import Swal from "sweetalert2";


function CaseSplitUpModal({ isOpen, onClose, data, companyId }) {
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

  // Check which design to show based on companyId
  const isGRECompany = companyId === "GRE_e978a792"; // Electrical design
  const isVGUCompany = companyId === "VGU_a2cb4a9d"; // Electronics design

  useEffect(() => {
    if (data && isOpen) {
      console.log("Raw data received in modal:", data);
      console.log("Company ID:", companyId);
      
      const rawData = data._raw || data;
      
      if (isGRECompany) {
        // GRE_e978a792 - Electrical design (CONDUIT, CABLES, OTHERS)
        const formData = {
          conduit: parseInt(rawData?.conduit) || 0,
          cables: parseInt(rawData?.cables) || 0,
          others: parseInt(rawData?.others) || 0
        };
        console.log("ELECTRICAL form data:", formData);
        setElectricalFormData(formData);
      } else if (isVGUCompany) {
        // VGU_a2cb4a9d - Electronics design (STABILIZER, WATER HEATER, OTHERS)
        const formData = {
          others: parseInt(rawData?.others) || 0,
          stabilizer: parseInt(rawData?.stabilizer) || 0,
          waterHeater: parseInt(rawData?.water_heater) || 0
        };
        console.log("ELECTRONICS form data:", formData);
        setElectronicsFormData(formData);
      }
    }
  }, [data, isOpen, isGRECompany, isVGUCompany]);

  const handleEditClick = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditValue(currentValue.toString());
  };

  const handleEditSave = () => {
    if (editingField && editValue !== "") {
      const newValue = parseInt(editValue) || 0;
      
      if (isGRECompany) {
        setElectricalFormData(prev => ({
          ...prev,
          [editingField]: newValue
        }));
      } else if (isVGUCompany) {
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
        sales_id: data?.sales_id || data?._raw?.sales_id || ""
      };

      if (isGRECompany) {
        updateData = {
          ...updateData,
          conduit: electricalFormData.conduit,
          cables: electricalFormData.cables,
          others: electricalFormData.others
        };
      } else if (isVGUCompany) {
        updateData = {
          ...updateData,
          others: electronicsFormData.others,
          stabilizer: electronicsFormData.stabilizer,
          water_heater: electronicsFormData.waterHeater
        };
      }

      console.log("Saving case split up data:", updateData);

      // Call the caseUpdate API with PUT method
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
             
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 text-lg font-semibold w-8 text-center">{value}</span>
              
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
            {isGRECompany ? (
              /* GRE_e978a792 - ELECTRICAL Design (First Image) */
              <>
                {renderInputField('conduit', 'CONDUIT', electricalFormData.conduit)}
                {renderInputField('cables', 'CABLES', electricalFormData.cables)}
                {renderInputField('others', 'OTHERS', electricalFormData.others)}
              </>
            ) : isVGUCompany ? (
              /* VGU_a2cb4a9d - ELECTRONICS Design (Second Image) */
              <>
                {renderInputField('others', 'OTHERS', electronicsFormData.others)}
                {renderInputField('stabilizer', 'STABILIZER', electronicsFormData.stabilizer)}
                {renderInputField('waterHeater', 'WATER HEATER', electronicsFormData.waterHeater)}
              </>
            ) : (
              /* Default fallback if companyId not recognized */
              <div className="text-center text-gray-500 py-4">
                Company type not recognized
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t">
          
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseSplitUpModal;