import React, { useState, useEffect } from "react";

export default function EditModal({ isOpen, onClose, formData, onSaveSuccess }) {
  const [localFormData, setLocalFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (formData) {
      console.log("EditModal received data:", {
        reference: formData.reference,
        regularBoxes: formData.regularBoxes,
        _raw: formData._raw
      });
      setLocalFormData(formData);
      setError(null);
    }
  }, [formData]);

  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        ...localFormData,
        company_id: localFormData.company_id || formData._raw?.company_id,
        companyName: localFormData.companyName,
      };

      console.log("Sending update data:", updateData);
      
      // Call parent's edit function
      const response = await onSaveSuccess(updateData);
      console.log("Update successful:", response);

      // ✅ Clear only the comment box
      setLocalFormData((prev) => ({
        ...prev,
        comments: "",
      }));

      onClose();
    } catch (err) {
      console.error("Error updating LR:", err);
      setError(err.message || "Failed to update record");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert DD-MM-YYYY to YYYY-MM-DD for date inputs
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Format datetime for datetime-local inputs
  const formatDateTimeForInput = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeStr)) {
      return dateTimeStr;
    }
    return dateTimeStr.replace(" ", "T").substring(0, 16);
  };

  if (!isOpen) return null;

  // Check if reference exists for conditional styling
  const hasReference = !!localFormData.reference;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-180 max-w-6xl p-6 overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          disabled={loading}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-gray-400 mb-4">EDIT RECORD</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Hidden fields for company_id */}
        <input type="hidden" name="company_id" value={localFormData.company_id || ""} />
        <input type="hidden" name="companyName" value={localFormData.companyName || ""} />

        <fieldset className="border-t border-gray-300 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={localFormData.companyName || ""}
                readOnly
                className="border border-gray-300 w-80 rounded p-2 bg-gray-200"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={localFormData.customerName || ""}
                readOnly
                className="border border-gray-300 w-full rounded p-2 bg-gray-200"
              />
            </div>

            {/* Customer City */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Customer City</label>
              <input
                type="text"
                name="customerCity"
                value={localFormData.customerCity || ""}
                readOnly
                className="border border-gray-300 w-full rounded p-2 bg-gray-200"
              />
            </div>

            {/* Transport Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Transport Name</label>
              <input
                type="text"
                name="transportName"
                value={localFormData.transportName || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>

            {/* Courier No */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Courier No</label>
              <input
                type="text"
                name="courierNo"
                value={localFormData.courierNo || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>

            {/* Invoice No */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Invoice No</label>
              <input
                type="text"
                name="invoiceNo"
                value={localFormData.invoiceNo || ""}
                readOnly
                className="border border-gray-300 w-full rounded p-2 bg-gray-200"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                value={formatDateForInput(localFormData.invoiceDate) || ""}
                readOnly
                className="border border-gray-300 w-full rounded p-2 bg-gray-200"
              />
            </div>

            {/* Invoice Value */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Invoice Value</label>
              <input
                type="text"
                name="invoiceValue"
                value={localFormData.invoiceValue || ""}
                readOnly
                className="border border-gray-300 w-full rounded p-2 bg-gray-200"
              />
            </div>

            {/* LR No */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">LR No</label>
              <input
                type="text"
                name="lrNo"
                value={localFormData.lrNo || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>

            {/* LR Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">LR Date</label>
              <input
                type="date"
                name="lrDate"
                value={formatDateForInput(localFormData.lrDate) || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>

            {/* No Of Boxes - UPDATED: Read-only when reference exists */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">No Of Boxes</label>
              <input
                type="number"
                name="regularBoxes"
                value={localFormData.regularBoxes || ""}
                onChange={handleLocalChange}
                className={`border focus:outline-[#6a1a13] w-full rounded p-2 ${
                  hasReference 
                    ? 'border-gray-300 bg-gray-200 cursor-not-allowed' 
                    : 'border-gray-300 focus:outline-[#6a1a13]'
                }`}
                disabled={loading || hasReference}
                readOnly={hasReference}
              />
              {hasReference && (
                <p className="text-xs text-gray-500 mt-1">
                  Reference number ({localFormData.reference}) present - boxes cannot be edited
                </p>
              )}
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Reference No</label>
              <input
                type="text"
                name="reference"
                value={localFormData.reference || ""}
                readOnly
                className="border border-gray-300 w-full rounded p-2 bg-gray-200"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Weight</label>
              <input
                type="text"
                name="weight"
                value={localFormData.weight || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>

            {/* Cheque No */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Cheque No</label>
              <input
                type="text"
                name="chequeNo"
                value={localFormData.chequeNo || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>

            {/* Cheque Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Cheque Date</label>
              <input
                type="date"
                name="chequeDate"
                value={formatDateForInput(localFormData.chequeDate) || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Eway Bill No</label>
              <input
                type="text"
                name="eway_bill_no"
                value={localFormData.eway_bill_no || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>

            {/* Comments */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-600">Comments</label>
              <textarea
                name="comments"
                value={localFormData.comments || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
                rows="3"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-600">Delivery status</label>
              <input
                type="text"
                name="status"
                value={localFormData.status || ""}
                onChange={handleLocalChange}
                className="border border-gray-300 focus:outline-[#6a1a13] w-full rounded p-2"
                disabled={loading}
              />
            </div>
          </div>
        </fieldset>

        {/* Section 2: App Delivery */}
        <fieldset className="border-t border-gray-300 pt-4 mt-6">
          <legend className="text-lg font-semibold text-gray-700 px-2">
            App Delivery Section
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            
            <div>
              <label className="block text-sm font-medium">Warehouse Person</label>
              <input
                type="text"
                name="warehouse_id"
                value={localFormData.warehouse_id || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Driver</label>
              <input
                type="text"
                name="driver_id"
                value={localFormData.driver_id || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Vehicle Number</label>
              <input
                type="text"
                name="vehicle_no"
                value={localFormData.vehicle_no || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Delivery Person</label>
              <input
                type="text"
                name="delivery_person_id"
                value={localFormData.delivery_person_id || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Collection Agent</label>
              <input
                type="text"
                name="agent_id"
                value={localFormData.agent_id || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Packed Time</label>
              <input
                type="datetime-local"
                name="packed_time"
                value={formatDateTimeForInput(localFormData.packed_time) || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Out Time</label>
              <input
                type="datetime-local"
                name="out_time"
                value={formatDateTimeForInput(localFormData.out_time) || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Delivered Time</label>
              <input
                type="datetime-local"
                name="delivered_time"
                value={formatDateTimeForInput(localFormData.delivered_time) || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Cheque Received Time</label>
              <input
                type="datetime-local"
                name="chq_received_time"
                value={formatDateTimeForInput(localFormData.chq_received_time) || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-200"
              />
            </div>
          </div>
        </fieldset>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button             
            onClick={handleSave}
            className="bg-[#6a1a13] hover:bg-[#865556] text-white px-4 py-2 rounded flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
