import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

const LRModal = ({ isOpen, onClose, data, onSave }) => {
  const [lrNumbers, setLrNumbers] = useState([{ id: 1, value: "" }]);
  const [loading, setLoading] = useState(false);

  // Initialize LR numbers when data changes
  useEffect(() => {
    if (data?.lrNo) {
      setLrNumbers([{ id: 1, value: data.lrNo }]);
    } else {
      setLrNumbers([{ id: 1, value: "" }]);
    }
  }, [data]);

  if (!isOpen) return null;

  // Helper function to convert any date format to YYYY-MM-DD for date inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    try {
      // If already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // If in DD-MM-YYYY format, convert to YYYY-MM-DD
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          // If day part has 4 digits, it's probably YYYY-MM-DD already
          if (day.length === 4) {
            return dateString;
          }
          // Convert DD-MM-YYYY to YYYY-MM-DD
          const fullYear = year.length === 2 ? `20${year}` : year;
          return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      // If it's a Date object or ISO string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Default empty data structure
  const formData = data || {
    salesId: "",
    companyName: "",
    customerName: "",
    customerCity: "",
    transportName: "",
    courierNo: "",
    invoiceNo: "",
    invoiceDate: "",
    invoiceValue: "",
    lrNo: "",
    lrDate: "",
    noOfBoxes: "",
    weight: "",
    chequeNo: "",
    chequeDate: "",
    appChequeNo: "",
    appChequeDate: "",
    appDeliverySection: "",
    warehousePerson: "",
    driver: "",
    vehicleNumber: "",
    deliveryPerson: "",
    collectionAgent: "",
    packedTime: "",
    outTime: "",
    deliveredTime: "",
    chequeReceivedTime: "",
    comments: ""
  };

 // In LRModal - UPDATED FORM SUBMISSION
// In LRModal.jsx - FIXED
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const form = new FormData(e.target);
    const submittedData = Object.fromEntries(form.entries());

    // ✅ COLLECT ALL LR NUMBERS AS SIMPLE ARRAY
    const allLrNumbers = [];
    
    lrNumbers.forEach((lr) => {
      const lrValue = form.get(`lrNo-${lr.id}`);
      if (lrValue && lrValue.toString().trim() !== '') {
        allLrNumbers.push(lrValue.toString().trim());
      }
    });

    const finalData = {
      ...submittedData,
      lrNumbers: allLrNumbers, // Simple array: ["50119771", "111", "1236"]
    };

    console.log("✅ Submitting data:", finalData);
    await onSave(finalData);
  } catch (error) {
    console.error("Error in form submission:", error);
  } finally {
    setLoading(false);
  }
};
  const addLrNumber = () => {
    setLrNumbers((prev) => [
      ...prev,
      { id: prev.length + 1, value: "" }
    ]);
  };

  const updateLrNumber = (id, value) => {
    setLrNumbers((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, value } : lr))
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-semibold text-gray-700">UPDATE LR RECORD</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Hidden input for salesId */}
          <input 
            type="hidden" 
            name="salesId" 
            value={formData.salesId} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Company & Customer Section */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  COMPANY NAME
                </label>
                <input
                  type="text"
                  name="companyName"
                  defaultValue={formData.companyName}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300 outline-none focus:border-gray-400"
                  placeholder="Enter company name"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  CUSTOMER NAME
                </label>
                <input
                  type="text"
                  name="customerName"
                  defaultValue={formData.customerName}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300 outline-none focus:border-gray-400"
                  placeholder="Enter customer name"
                  readOnly
                />
              </div>
            </div>

            {/* Customer City & Transport */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                CUSTOMER CITY
              </label>
              <input
                type="text"
                name="customerCity"
                defaultValue={formData.customerCity}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300 outline-none focus:border-gray-400"
                placeholder="Enter city"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                TRANSPORT NAME
              </label>
              <input
                type="text"
                name="transportName"
                defaultValue={formData.transportName}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:border-gray-400"
                placeholder="Enter transport name"
              />
            </div>

            {/* Courier & Invoice Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                COURIER NO
              </label>
              <input
                type="text"
                name="courierNo"
                defaultValue={formData.courierNo}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:border-gray-400"
                placeholder="Enter courier number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                INVOICE NO
              </label>
              <input
                type="text"
                name="invoiceNo"
                defaultValue={formData.invoiceNo}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300 outline-none focus:border-gray-400"
                placeholder="Enter invoice number"
                readOnly
              />
            </div>

            {/* Invoice Date & Value */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                INVOICE DATE
              </label>
              <input
                type="date"
                name="invoiceDate"
                defaultValue={formatDateForInput(formData.invoiceDate)}
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300 outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                INVOICE VALUE
              </label>
              <input
                type="number"
                name="invoiceValue"
                defaultValue={formData.invoiceValue}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300 outline-none focus:border-gray-400"
                placeholder="Enter invoice value"
                readOnly
              />
            </div>

            {/* LR Numbers Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-4">
                LR NUMBERS
              </label>
              <div className="flex items-end gap-4 flex-wrap">
                {lrNumbers.map((lr) => (
                  <div key={lr.id} className="flex items-end gap-2">
                    <div className="flex flex-col">
                      <label className="block text-xs text-gray-500 mb-1">
                        LR NO -{lr.id}
                      </label>
                      <input
                        type="text"
                        name={`lrNo-${lr.id}`}
                        value={lr.value}
                        onChange={(e) => updateLrNumber(lr.id, e.target.value)}
                        className="w-40 border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:border-gray-400"
                        placeholder={`LR ${lr.id}`}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLrNumber}
                  className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors mb-1"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* LR Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                LR DATE
              </label>
              <input
                type="date"
                name="lrDate"
                defaultValue={formatDateForInput(formData.lrDate)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:border-gray-400"
              />
            </div>

            {/* Boxes & Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                NO OF BOXES
              </label>
              <input
                type="number"
                name="noOfBoxes"
                defaultValue={formData.noOfBoxes}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:border-gray-400"
                placeholder="Enter number of boxes"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                WEIGHT (IN KG)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                defaultValue={formData.weight}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:border-gray-400"
                placeholder="Enter weight"
              />
            </div>

            {/* Cheque Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                CHEQUE NO
              </label>
              <input
                type="text"
                name="chequeNo"
                defaultValue={formData.chequeNo}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:border-gray-400"
                placeholder="Enter cheque number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                CHEQUE DATE
              </label>
              <input
                type="date"
                name="chequeDate"
                defaultValue={formatDateForInput(formData.chequeDate)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:border-gray-400"
              />
            </div>

            {/* App Delivery Section */}
            <fieldset className="md:col-span-2 border border-gray-300 rounded-lg p-4 bg-blue-50">
              <legend className="text-lg font-semibold text-gray-700 px-2 bg-blue-50">
                App Delivery Section
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    APP CHEQUE NO
                  </label>
                  <input
                    type="text"
                    name="appChequeNo"
                    defaultValue={formData.appChequeNo}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300 outline-none focus:border-gray-400"
                    placeholder="Enter app cheque number"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    APP CHEQUE DATE
                  </label>
                  <input
                    type="date"
                    name="appChequeDate"
                    defaultValue={formatDateForInput(formData.appChequeDate)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    readOnly
                  />
                </div>
              </div>
            </fieldset>

            {/* Delivery Personnel Section */}
            <fieldset className="md:col-span-2 border border-gray-300 rounded-lg p-4 bg-green-50">
              <legend className="text-lg font-semibold text-gray-700 px-2 bg-green-50">
                Delivery Personnel
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    WAREHOUSE PERSON
                  </label>
                  <input
                    type="text"
                    name="warehousePerson"
                    defaultValue={formData.warehousePerson}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    placeholder="Enter warehouse person"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    DRIVER
                  </label>
                  <input
                    type="text"
                    name="driver"
                    defaultValue={formData.driver}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    placeholder="Enter driver name"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    VEHICLE NUMBER
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    defaultValue={formData.vehicleNumber}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    placeholder="Enter vehicle number"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    DELIVERY PERSON
                  </label>
                  <input
                    type="text"
                    name="deliveryPerson"
                    defaultValue={formData.deliveryPerson}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    placeholder="Enter delivery person"
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    COLLECTION AGENT
                  </label>
                  <input
                    type="text"
                    name="collectionAgent"
                    defaultValue={formData.collectionAgent}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    placeholder="Enter collection agent"
                    readOnly
                  />
                </div>
              </div>
            </fieldset>

            {/* Time Stamps */}
            <fieldset className="md:col-span-2 border border-gray-300 rounded-lg p-4 bg-purple-50">
              <legend className="text-lg font-semibold text-gray-700 px-2 bg-purple-50">
                Time Stamps
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    PACKED TIME
                  </label>
                  <input
                    type="datetime-local"
                    name="packedTime"
                    defaultValue={formData.packedTime}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    OUT TIME
                  </label>
                  <input
                    type="datetime-local"
                    name="outTime"
                    defaultValue={formData.outTime}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300 outline-none focus:border-gray-400"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    DELIVERED TIME
                  </label>
                  <input
                    type="datetime-local"
                    name="deliveredTime"
                    defaultValue={formData.deliveredTime}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    CHEQUE RECEIVED TIME
                  </label>
                  <input
                    type="datetime-local"
                    name="chequeReceivedTime"
                    defaultValue={formData.chequeReceivedTime}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-300  outline-none focus:border-gray-400"
                    readOnly
                  />
                </div>
              </div>
            </fieldset>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#6a1a12] hover:bg-[#955d5d] text-white rounded-md  transition-colors disabled:bg-rose-300"
            >
              {loading ? "Updating..." : "Update Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LRModal;