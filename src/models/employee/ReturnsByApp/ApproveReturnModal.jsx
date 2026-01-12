import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const ApproveReturnModal = ({ 
  isOpen, 
  onClose, 
  returnData, 
  onApproveSubmit 
}) => {
  const [approvalData, setApprovalData] = useState({
    boxChecked: false,
    notChecked: false,
    salable: true,
    expired: false,
    boxNumber: ""
  });

  console.log("Checking Approve: ",returnData);
  
  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen && returnData) {
      setApprovalData({
        boxChecked: false,
        notChecked: false,
        salable: true,
        expired: false,
        boxNumber: returnData.boxNo || ""
      });
    }
  }, [isOpen, returnData]);

  // Handle approval form changes
  const handleApprovalChange = (field, value) => {
    setApprovalData(prev => ({
      ...prev,
      [field]: value
    }));

    // Handle radio button logic
    if (field === 'boxChecked' && value) {
      setApprovalData(prev => ({ ...prev, notChecked: false }));
    }
    if (field === 'notChecked' && value) {
      setApprovalData(prev => ({ ...prev, boxChecked: false }));
    }
    if (field === 'salable' && value) {
      setApprovalData(prev => ({ ...prev, expired: false }));
    }
    if (field === 'expired' && value) {
      setApprovalData(prev => ({ ...prev, salable: false }));
    }
  };

  // Handle approval submission
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!approvalData.boxChecked && !approvalData.notChecked) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please select Box Status',
          confirmButtonColor: '#842626'
        });
        return;
      }

      if (!approvalData.salable && !approvalData.expired) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please select Return Type',
          confirmButtonColor: '#842626'
        });
        return;
      }

      if (!approvalData.boxNumber.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please enter Box Number',
          confirmButtonColor: '#842626'
        });
        return;
      }

      // Call the submit function passed from parent
      await onApproveSubmit(returnData, approvalData);
      
      // Close modal on successful submission
      onClose();

    } catch (error) {
      console.error("Error submitting approval:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Failed to submit approval. Please try again.',
        confirmButtonColor: '#842626'
      });
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    setApprovalData({
      boxChecked: false,
      notChecked: false,
      salable: true,
      expired: false,
      boxNumber: ""
    });
    onClose();
  };

  if (!isOpen || !returnData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Modal Header */}
        <div className="bg-[#6a1a13] text-white p-4 rounded-t-xl">
          <h3 className="text-lg font-semibold">Approve Return Box</h3>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Box Information Section */}
          <div className="border-b pb-4">
            <h4 className="font-bold text-xl text-gray-400 mb-3">Box Information</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xm font-bold text-gray-600 mb-1 ml-6">CUSTOMER :</label>
                <p className="text-sm text-gray-500 font-bold ml-8 mb-4">
                  {returnData.customer}, {returnData.city}
                </p>
              </div>
              <div>
                <label className="block text-xm font-bold text-gray-600 mb-1 ml-6">TRANSPORT :</label>
                <p className="text-sm text-gray-500 font-bold ml-8 mb-4">{returnData.transport}</p>
              </div>
            </div>
          </div>

          {/* Approval Details Section */}
          <div>
            <h4 className="font-bold text-xl text-gray-400 mb-3">Approval Details</h4>
            
            {/* Box Status */}
            <div className="mb-4">
              <label className="block text-xm font-semibold text-gray-600 mb-1 ml-6">BOX STATUS:</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="boxStatus"
                    checked={approvalData.boxChecked}
                    onChange={(e) => handleApprovalChange('boxChecked', e.target.checked)}
                    className="h-4 w-4 text-[#842626] border-gray-300 focus:ring-[#842626] ml-8"
                  />
                  <span className="ml-2 text-sm text-gray-700">Checked</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="boxStatus"
                    checked={approvalData.notChecked}
                    onChange={(e) => handleApprovalChange('notChecked', e.target.checked)}
                    className="h-4 w-4 text-[#842626] border-gray-300 focus:ring-[#842626] ml-8"
                  />
                  <span className="ml-2 text-sm text-gray-700">Not Checked</span>
                </label>
              </div>
            </div>

            {/* Return Type */}
            <div className="mb-4">
              <label className="block text-xm font-semibold text-gray-600 mb-1 ml-6">RETURN TYPE:</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="returnType"
                    checked={approvalData.salable}
                    onChange={(e) => handleApprovalChange('salable', e.target.checked)}
                    className="h-4 w-4 text-[#842626] border-gray-300 focus:ring-[#842626] ml-8"
                  />
                  <span className="ml-2 text-sm text-gray-700">Salable</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="returnType"
                    checked={approvalData.expired}
                    onChange={(e) => handleApprovalChange('expired', e.target.checked)}
                    className="h-4 w-4 text-[#842626] border-gray-300 focus:ring-[#842626] ml-8"
                  />
                  <span className="ml-2 text-sm text-gray-700">Expired</span>
                </label>
              </div>
            </div>

            {/* Box Number */}
            <div>
              <label className="block text-xm font-semibold text-gray-600 mb-1 ml-6">BOX NUMBER:</label>
              <input
                type="text"
                value={approvalData.boxNumber}
                onChange={(e) => handleApprovalChange('boxNumber', e.target.value)}
                className="w-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6a1a13] ml-8"
                placeholder="Enter box number"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between p-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:text-white hover:bg-gray-400 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#6a1a13] text-white font-semibold rounded-lg hover:bg-[#865556] transition-colors text-sm"
          >
            Submit Approval
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveReturnModal;