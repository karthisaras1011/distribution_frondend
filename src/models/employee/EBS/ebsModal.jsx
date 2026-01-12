import React, { useState } from "react";

const EbsModal = ({ rowData, onClose, onUpdate, updateLoading }) => {
  const [activeTab, setActiveTab] = useState("returnDetails");
  const [formData, setFormData] = useState({
    courierNo: rowData["Courier no"] || "05147",
    transportName: rowData["Transport name"] || "",
    noOfBoxes: rowData["No of boxes"] || "",
    boxNo: rowData["Box no"] || "",
    boxStatus: rowData["Box status"] || "Not checked",
    returnType: rowData.Condition || "Expired",
    customerCity: rowData["Customer city"] || "",
    // Credit Details
    mraNo: rowData["MRA No"] || "",
    mraDate: rowData["MRA Date"] || "",
    creditNo: rowData["Credit No"] || "",
    creditDate: rowData["Credit Date"] || ""
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Return Details ku separate function
  const handleReturnDetailsSubmit = () => {
    const updatedFields = {};
    
    // Return details fields check pannu
    if (formData.courierNo !== rowData["Courier no"]) {
      updatedFields.courierNo = formData.courierNo;
    }
    if (formData.transportName !== rowData["Transport name"]) {
      updatedFields.transportName = formData.transportName;
    }
    if (formData.noOfBoxes !== rowData["No of boxes"]) {
      updatedFields.noOfBoxes = formData.noOfBoxes;
    }
    if (formData.boxNo !== rowData["Box no"]) {
      updatedFields.boxNo = formData.boxNo;
    }
    if (formData.boxStatus !== rowData["Box status"]) {
      updatedFields.boxStatus = formData.boxStatus;
    }
    if (formData.returnType !== rowData.Condition) {
      updatedFields.returnType = formData.returnType;
    }
    if (formData.customerCity !== rowData["Customer city"]) {
      updatedFields.customerCity = formData.customerCity;
    }

    const dataToSend = {
      uniqueId: rowData["Unique ID"],
      updateType: "returnDetails", // Type add pannu
      ...updatedFields
    };

    console.log("📦 RETURN DETAILS - CHANGED FIELDS:");
    console.log("Changed Fields:", updatedFields);
    console.log("Final Data to Send:", dataToSend);
    
    onUpdate(dataToSend);
  };

  // Credit Details ku separate function
  const handleCreditDetailsSubmit = () => {
    const updatedFields = {};
    
    // Credit details fields check pannu
    if (formData.mraNo !== rowData["MRA No"]) {
      updatedFields.mraNo = formData.mraNo;
    }
    if (formData.mraDate !== rowData["MRA Date"]) {
      updatedFields.mraDate = formData.mraDate;
    }
    if (formData.creditNo !== rowData["Credit No"]) {
      updatedFields.creditNo = formData.creditNo;
    }
    if (formData.creditDate !== rowData["Credit Date"]) {
      updatedFields.creditDate = formData.creditDate;
    }

    const dataToSend = {
      uniqueId: rowData["Unique ID"],
      updateType: "creditDetails", // Type add pannu
      ...updatedFields
    };

    console.log("💰 CREDIT DETAILS - CHANGED FIELDS:");
    console.log("Changed Fields:", updatedFields);
    console.log("Final Data to Send:", dataToSend);
    
    onUpdate(dataToSend);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      console.log("Delete record:", rowData);
      onClose();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {activeTab === "returnDetails" ? "Return details update" : "Credit details update"}
        </h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-2xl"
          disabled={updateLoading}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("returnDetails")}
            disabled={updateLoading}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === "returnDetails"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            } ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Return Details
          </button>
          <button
            onClick={() => setActiveTab("creditDetails")}
            disabled={updateLoading}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === "creditDetails"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            } ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Credit Details
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {activeTab === "returnDetails" ? (
          /* Return Details Tab */
          <>
            {/* Company Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  COMPANY NAME
                </label>
                <div className="text-gray-900 font-medium">
                  {rowData["Company name"]}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RETURN TYPE
                </label>
                <select
                  value={formData.returnType}
                  onChange={(e) => handleChange("returnType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={updateLoading}
                >
                  <option value="Saleable">Saleable</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            {/* Customer Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CUSTOMER NAME
                </label>
                <div className="text-gray-900 font-medium">
                  
                  {rowData["Customer name"]}
                  
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CUSTOMER CITY
                </label>
                <input
                  type="text"
                  value={formData.customerCity}
                  onChange={(e) => handleChange("customerCity", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={updateLoading}
                  placeholder="Enter customer city"
                />
              </div>
            </div>

            {/* Courier Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  COURIER NO
                </label>
                <input
                  type="text"
                  value={formData.courierNo}
                  onChange={(e) => handleChange("courierNo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={updateLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TRANSPORT NAME
                </label>
                <input
                  type="text"
                  value={formData.transportName}
                  onChange={(e) => handleChange("transportName", e.target.value)}
                  placeholder="Enter transport name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={updateLoading}
                  
                />
              </div>
            </div>

            {/* Box Details Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                BOX DETAILS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NO OF BOXES
                  </label>
                  <input
                    type="number"
                    value={formData.noOfBoxes}
                    onChange={(e) => handleChange("noOfBoxes", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={updateLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BOX NO
                  </label>
                  <input
                    type="text"
                    value={formData.boxNo}
                    onChange={(e) => handleChange("boxNo", e.target.value)}
                    placeholder="Enter box number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={updateLoading}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BOX STATUS
                  </label>
                  <select
                    value={formData.boxStatus}
                    onChange={(e) => handleChange("boxStatus", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={updateLoading}
                  >
                    <option value="Not checked">Not checked</option>
                    <option value="Checked">Checked</option>
                    <option value="In transit">In transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons for Return Details */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                disabled={updateLoading}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnDetailsSubmit} // Separate function call
                disabled={updateLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </>
        ) : (
          /* Credit Details Tab */
          <>
            {/* MRA Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRA NO
                </label>
                <input
                  type="text"
                  value={formData.mraNo}
                  onChange={(e) => handleChange("mraNo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter MRA number"
                  disabled={updateLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRA DATE
                </label>
                <input
                  type="date"
                  value={formData.mraDate}
                  onChange={(e) => handleChange("mraDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={updateLoading}
                />
              </div>
            </div>

            {/* Credit Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CREDIT NO
                </label>
                <input
                  type="text"
                  value={formData.creditNo}
                  onChange={(e) => handleChange("creditNo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter credit number"
                  disabled={updateLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CREDIT DATE
                </label>
                <input
                  type="date"
                  value={formData.creditDate}
                  onChange={(e) => handleChange("creditDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={updateLoading}
                />
              </div>
            </div>

           

            {/* Action Buttons for Credit Details */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleDelete}
                disabled={updateLoading}
                className="px-6 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={handleCreditDetailsSubmit} // Separate function call
                disabled={updateLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EbsModal;