import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { getCompanyByCustomer, getTransport } from '../../../service/employee/returns';
import { insertCredit, updateReturn, deleteCredit } from '../../../service/admin/return';
import Swal from 'sweetalert2';

const defaultFormData = {
  company_id: '',
  company_name: '',
  return_type: '',
  customer_id: '',
  customer_name: '',
  customer_city: '',
  courier_no: '',
  transport_name: '',
  no_of_boxes: '',
  box_no: '',
  box_status: 'not-checked',
};

const defaultCreditData = {
  mraNo: '',
  mraDate: '',
  creditNo: '',
  creditDate: '',
};

const Returnmodel = ({ isOpen, onClose, onSave, returnData, isEditMode }) => {
  const [activeTab, setActiveTab] = useState('return');
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [creditData, setCreditData] = useState(defaultCreditData);
  const [creditHistory, setCreditHistory] = useState([]);
  const [transports, setTransports] = useState([]);
  const [filteredTransports, setFilteredTransports] = useState([]);
  const [transportSearch, setTransportSearch] = useState("");
  const [showTransportDropdown, setShowTransportDropdown] = useState(false);
  
  const transportRef = useRef(null);

  // 🔹 Map backend values to UI values
  const mapBackendToUI = (backendData) => {
    if (!backendData) return defaultFormData;
    
    const uiData = { ...defaultFormData };
    
    // Map all fields from backendData to formData
    Object.keys(backendData).forEach(key => {
      if (uiData.hasOwnProperty(key)) {
        uiData[key] = backendData[key] || '';
      }
    });

    // SPECIAL HANDLING FOR RETURN TYPE - Map 1/0 to salable/expired
    if (backendData.return_type !== undefined) {
      uiData.return_type = backendData.return_type === 1 ? 'salable' : 'expired';
    } else if (backendData.returns_type !== undefined) {
      uiData.return_type = backendData.returns_type === 1 ? 'salable' : 'expired';
    }

    // SPECIAL HANDLING FOR BOX STATUS - Map 1/0 to checked/not-checked
    if (backendData.box_checked !== undefined) {
      uiData.box_status = backendData.box_checked === 1 ? 'checked' : 'not-checked';
    }

    return uiData;
  };

  // 🔹 Map UI values to backend values
  const mapUIToBackend = (uiData) => {
    const backendData = { ...uiData };
    
    // Map return_type to 1/0 for backend
    if (uiData.return_type === 'salable') {
      backendData.return_type = 1;
      backendData.returns_type = 1;
    } else if (uiData.return_type === 'expired') {
      backendData.return_type = 0;
      backendData.returns_type = 0;
    }

    // Map box_status to 1/0 for backend
    backendData.box_checked = uiData.box_status === 'checked' ? 1 : 0;

    return backendData;
  };

  // 🔹 Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (returnData) {
        console.log("Editing return data:", returnData);
        
        // Map backend data to UI format
        const uiFormData = mapBackendToUI(returnData);
        const initializedCreditData = { ...defaultCreditData };

        // Set credit data from returnData.credit_details array (use first record as default)
        if (returnData.credit_details && Array.isArray(returnData.credit_details) && returnData.credit_details.length > 0) {
          const firstCredit = returnData.credit_details[0];
          if (firstCredit.mra_no) initializedCreditData.mraNo = firstCredit.mra_no;
          if (firstCredit.mra_date) initializedCreditData.mraDate = firstCredit.mra_date;
          if (firstCredit.credit_no) initializedCreditData.creditNo = firstCredit.credit_no;
          if (firstCredit.credit_date) initializedCreditData.creditDate = firstCredit.credit_date;
        }

        setFormData(uiFormData);
        setCreditData(initializedCreditData);

        // Set transport search to existing transport name
        if (returnData.transport_name) {
          setTransportSearch(returnData.transport_name);
        }

        // Build credit history from credit_details array
        const history = [];
        if (returnData.credit_details && Array.isArray(returnData.credit_details)) {
          returnData.credit_details.forEach((credit, index) => {
            if (credit.credit_no || credit.credit_date) {
              history.push({
                id: credit.credit_id || `credit-${index}-${Date.now()}`,
                type: 'credit',
                number: credit.credit_no || '',
                date: credit.credit_date || '',
                credit_id: credit.credit_id
              });
            }
            if (credit.mra_no || credit.mra_date) {
              history.push({
                id: credit.credit_id || `mra-${index}-${Date.now()}`,
                type: 'mra',
                number: credit.mra_no || '',
                date: credit.mra_date || '',
                credit_id: credit.credit_id
              });
            }
          });
        }
        setCreditHistory(history);

        console.log("Final UI form data:", uiFormData);
        console.log("Final credit data:", initializedCreditData);
        console.log("Credit history:", history);

      } else {
        // Reset to defaults for new entry
        setFormData(defaultFormData);
        setCreditData(defaultCreditData);
        setCreditHistory([]);
        setTransportSearch("");
      }
    }
  }, [isOpen, returnData]);

  // 🔹 Fetch customers when company_id changes
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!formData.company_id) {
        setCustomers([]);
        return;
      }
      
      try {
        setLoadingCustomers(true);
        const response = await getCompanyByCustomer(formData.company_id);
        console.log("Customers API Response: ", response);
        
        const customersData = response.data || response;
        setCustomers(customersData);

        // If we're editing and have existing customer data, ensure it's in the customers list
        if (returnData && returnData.customer_id && customersData.length > 0) {
          const existingCustomer = customersData.find(c => 
            String(c.customer_id) === String(returnData.customer_id)
          );
          
          if (!existingCustomer) {
            // Add the current customer to the list if not found
            setCustomers(prev => [
              ...prev,
              {
                customer_id: returnData.customer_id,
                customer_name: returnData.customer_name,
                customer_city: returnData.customer_city
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Failed to load customers:', error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    if (formData.company_id) {
      fetchCustomers();
    } else {
      setCustomers([]);
      if (!returnData) {
        setFormData(prev => ({
          ...prev,
          customer_id: '',
          customer_name: '',
          customer_city: '',
        }));
      }
    }
  }, [formData.company_id, returnData]);

  // Fetch transport list
  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const response = await getTransport();
        setTransports(response.data || response);
        setFilteredTransports(response.data || response);
      } catch (err) {
        console.error('Failed to load transport names:', err);
        Swal.fire({
          title: "Error",
          text: "Failed to load transport names!",
          icon: "error",
          confirmButtonColor: "#6a1a12",
        });
      }
    };
    fetchTransport();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (transportRef.current && !transportRef.current.contains(event.target)) {
        setShowTransportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔹 Customer selection
  const handleCustomerChange = (e) => {
    const selectedCustomerId = String(e.target.value);
    console.log("Selected customer ID:", selectedCustomerId);
    
    if (selectedCustomerId === "") {
      setFormData(prev => ({
        ...prev,
        customer_id: '',
        customer_name: '',
        customer_city: '',
      }));
      return;
    }

    const selectedCustomer = customers.find(c => String(c.customer_id) === selectedCustomerId);

    if (selectedCustomer) {
      console.log("Selected customer:", selectedCustomer);
      setFormData(prev => ({
        ...prev,
        customer_id: selectedCustomer.customer_id || '',
        customer_name: selectedCustomer.customer_name || '',
        customer_city: selectedCustomer.customer_city || '',
      }));
    } else {
      console.log("Customer not found in list, keeping existing data");
    }
  };

  // 🔹 Handle return type change
  const handleReturnTypeChange = (e) => {
    const { value } = e.target;
    console.log("Return type changed to:", value);
    setFormData(prev => ({ 
      ...prev, 
      return_type: value 
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value || ''
    }));
  };

  const handleCreditChange = (e) => {
    const { name, value } = e.target;
    console.log(`Credit field changed - ${name}: ${value}`);
    setCreditData(prev => ({ 
      ...prev, 
      [name]: value || ''
    }));
  };

  const handleDeleteCredit = async (creditItem) => {
    if (!isEditMode) return;
    
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete ${creditItem.type === 'mra' ? 'EBS Credit' : 'Salable Credit'} ${creditItem.number}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6a1a12",
        cancelButtonColor: "#4b5563",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      });

      if (result.isConfirmed && creditItem.credit_id) {
        // Call the deleteCredit API
        const response = await deleteCredit({
          credit_id: creditItem.credit_id,
          [creditItem.type === 'mra' ? 'mra_no' : 'credit_no']: creditItem.number
        });

        if (response.data.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Credit record has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          // Remove from local state
          setCreditHistory(prev => prev.filter(credit => credit.id !== creditItem.id));
          
          // Refresh parent data
          if (onSave) {
            onSave();
          }
        } else {
          throw new Error(response.data.message || "Delete failed");
        }
      }
    } catch (error) {
      console.error("Error deleting credit:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to delete credit record. Please try again.",
        icon: "error",
        confirmButtonColor: "#6a1a12",
      });
    }
  };

  // Search filter (Transport)
  const handleTransportSearchChange = (e) => {
    const value = e.target.value;
    setTransportSearch(value);
    setShowTransportDropdown(true);
    
    setFormData(prev => ({ 
      ...prev, 
      transport_name: value 
    }));
    
    const filtered = transports.filter((t) =>
      t.transport_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransports(filtered);
  };

  const handleTransportSelect = (transport) => {
    setFormData((prev) => ({ 
      ...prev, 
      transport_name: transport.transport_name 
    }));
    setTransportSearch(transport.transport_name);
    setShowTransportDropdown(false);
  };

  // 🔹 Function to handle credit insertion only
  const handleCreditInsert = async () => {
    try {
      // Validate that we have a return_id
      if (!returnData?.return_id) {
        Swal.fire({
          title: "Error!",
          text: "Return ID is missing. Cannot insert credit details.",
          icon: "error",
          confirmButtonColor: "#6a1a12",
        });
        return;
      }

      // Validate that at least one credit field is filled
      if (!creditData.mraNo && !creditData.creditNo) {
        Swal.fire({
          title: "Validation Error!",
          text: "Please enter either EBS Credit No or Salable Credit No.",
          icon: "warning",
          confirmButtonColor: "#6a1a12",
        });
        return;
      }

      // Prepare credit data for insertion
      const creditSubmitData = {
        returns_id: returnData.return_id,
        credit_no: creditData.creditNo || '',
        credit_date: creditData.creditDate || '',
        mra_no: creditData.mraNo || '',
        mra_date: creditData.mraDate || '',
      };

      console.log("📋 Credit Data to be inserted:", creditSubmitData);

      const result = await Swal.fire({
        title: "Insert Credit Details?",
        text: "This will add new credit information for this return.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, insert credit!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#6a1a12",
        cancelButtonColor: "#4b5563",
      });

      if (result.isConfirmed) {
        // Call the insertCredit API
        const response = await insertCredit(creditSubmitData);
        
        if (response.data.success) {
          console.log("✅ Credit insertion successful:", response);
          
          Swal.fire({
            title: "Success!",
            text: "Credit details have been inserted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          // Clear credit input fields after successful insertion
          setCreditData(defaultCreditData);
          
          // Refresh the credit history by fetching updated data
          if (onSave) {
            onSave(); // This will trigger parent to refresh data
          }
        } else {
          throw new Error(response.data.message || "Credit insertion failed");
        }
      }
    } catch (error) {
      console.error("❌ Error inserting credit:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to insert credit details. Please try again.",
        icon: "error",
        confirmButtonColor: "#6a1a12",
      });
    }
  };

  // 🔹 Function to handle return details update
  const handleReturnUpdate = async () => {
    try {
      // Validate that we have a return_id
      if (!returnData?.return_id) {
        Swal.fire({
          title: "Error!",
          text: "Return ID is missing. Cannot update return details.",
          icon: "error",
          confirmButtonColor: "#6a1a12",
        });
        return;
      }

      // Map UI data to backend format
      const backendFormData = mapUIToBackend(formData);
      
      // Prepare return update data
      const returnUpdateData = {
        return_id: returnData.return_id,
        ...backendFormData,
      };

      console.log("📋 Return Data to be updated:", returnUpdateData);

      const result = await Swal.fire({
        title: "Update Return Details?",
        text: "This will update the return information.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, update return!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#6a1a12",
        cancelButtonColor: "#4b5563",
      });

      if (result.isConfirmed) {
        // Call the updateReturn API
        const response = await updateReturn(returnUpdateData);
        
        if (response.data.success) {
          console.log("✅ Return update successful:", response);
          
          Swal.fire({
            title: "Success!",
            text: "Return details have been updated successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          // Close modal and refresh parent data
          if (onSave) {
            onSave();
          }
          onClose();
        } else {
          throw new Error(response.data.message || "Return update failed");
        }
      }
    } catch (error) {
      console.error("❌ Error updating return:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update return details. Please try again.",
        icon: "error",
        confirmButtonColor: "#6a1a12",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'credit') {
      // If we're on credit tab, insert credit only
      await handleCreditInsert();
      return;
    } else if (activeTab === 'return') {
      // If we're on return tab, update return details
      await handleReturnUpdate();
      return;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#6a1a12] to-[#8a2b2b]">
          <h2 className="text-xl font-semibold text-white">
            {isEditMode ? 'Update Return Details' : 'Return Details'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b flex bg-gray-50">
          <button
            type="button"
            onClick={() => setActiveTab('return')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'return'
                ? 'border-[#6a1a12] text-[#6a1a12] bg-white'
                : 'border-transparent text-gray-600 hover:text-[#6a1a12] hover:bg-gray-100'
            }`}
          >
            Return Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credit')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'credit'
                ? 'border-[#6a1a12] text-[#6a1a12] bg-white'
                : 'border-transparent text-gray-600 hover:text-[#6a1a12] hover:bg-gray-100'
            }`}
          >
            Credit Details ({creditHistory.length})
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* --- Return Tab --- */}
          {activeTab === 'return' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">COMPANY NAME</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-medium focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RETURN TYPE</label>
                  <select
                    name="return_type"
                    value={formData.return_type || ''}
                    onChange={handleReturnTypeChange}
                    disabled={!isEditMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select return type</option>
                    <option value="salable">Salable</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {/* Customer Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SELECT CUSTOMER</label>
                    <select
                      name="customer_id"
                      value={formData.customer_id || ''}
                      onChange={handleCustomerChange}
                      disabled={!isEditMode || !formData.company_id || loadingCustomers}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                        <option key={c.customer_id} value={c.customer_id}>
                          {c.customer_name} - {c.customer_city}
                        </option>
                      ))}
                      {formData.customer_id && !customers.find(c => String(c.customer_id) === String(formData.customer_id)) && (
                        <option value={formData.customer_id}>
                          {formData.customer_name} - {formData.customer_city} (Current)
                        </option>
                      )}
                    </select>
                    {loadingCustomers && <p className="text-sm text-gray-500 mt-1">Loading customers...</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CUSTOMER NAME</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-medium focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CUSTOMER CITY</label>
                    <input
                      type="text"
                      name="customer_city"
                      value={formData.customer_city || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-medium focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12]"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">COURIER NO</label>
                    <input
                      type="text"
                      name="courier_no"
                      value={formData.courier_no || ''}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="relative" ref={transportRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TRANSPORT NAME
                    </label>
                    <input
                      type="text"
                      value={transportSearch}
                      onChange={handleTransportSearchChange}
                      onFocus={() => setShowTransportDropdown(true)}
                      disabled={!isEditMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Search transport name..."
                    />
                    {showTransportDropdown && filteredTransports.length > 0 && isEditMode && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto">
                        {filteredTransports.map((t, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleTransportSelect(t)}
                          >
                            {t.transport_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">BOX DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NO OF BOXES</label>
                    <input
                      type="number"
                      name="no_of_boxes"
                      value={formData.no_of_boxes || ''}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BOX NO</label>
                    <input
                      type="text"
                      name="box_no"
                      value={formData.box_no || ''}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BOX STATUS</label>
                    <select
                      name="box_status"
                      value={formData.box_status || 'not-checked'}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="not-checked">Not checked</option>
                      <option value="checked">Checked</option>
                    </select>
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="bg-[#6a1a12]/10 border border-[#6a1a12]/30 rounded-lg p-4">
                  <p className="text-[#6a1a12] text-sm">
                    <strong>Note:</strong> You can update the return details in this tab.
                  </p>
                </div>
              )}
            </>
          )}

          {/* --- Credit Tab --- */}
          {activeTab === 'credit' && (
            <>
              <div className="bg-[#6a1a12]/10 border border-[#6a1a12]/30 rounded-lg p-4 mb-6">
                <p className="text-[#6a1a12] text-sm">
                  <strong>Info:</strong> You can insert credit information for Return ID: <strong className="font-bold">{returnData?.return_id}</strong>
                  {creditHistory.length > 0 && (
                    <span> | Total Credit Records: <strong className="font-bold">{creditHistory.length}</strong></span>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Credit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">EBS Credit No</label>
                    <input
                      type="text"
                      name="mraNo"
                      value={creditData.mraNo || ''}
                      onChange={handleCreditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12]"
                      placeholder="Enter EBS Credit Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">EBS Credit Date</label>
                    <input
                      type="date"
                      name="mraDate"
                      value={creditData.mraDate || ''}
                      onChange={handleCreditChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salable Credit No</label>
                    <input
                      type="text"
                      name="creditNo"
                      value={creditData.creditNo || ''}
                      onChange={handleCreditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12]"
                      placeholder="Enter Salable Credit Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salable Credit Date</label>
                    <input
                      type="date"
                      name="creditDate"
                      value={creditData.creditDate || ''}
                      onChange={handleCreditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6a1a12]/20 focus:border-[#6a1a12]"
                    />
                  </div>
                </div>
              </div>

              {creditHistory.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="text-md font-medium text-gray-900">Credit History ({creditHistory.length} records)</h4>
                  </div>
                  <table className="min-w-full">
                    <thead className="bg-[#6a1a12] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">TYPE</th>
                        <th className="px-4 py-3 text-left font-medium">CREDIT NO</th>
                        <th className="px-4 py-3 text-left font-medium">CREDIT DATE</th>
                        {isEditMode && (
                          <th className="px-4 py-3 text-center font-medium">ACTIONS</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {creditHistory.map((c, index) => (
                        <tr 
                          key={c.id} 
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                        >
                          <td className="px-4 py-3 border-t">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.type === 'mra' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {c.type === 'mra' ? 'EBS Credit' : 'Salable Credit'}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-t font-medium">{c.number || ''}</td>
                          <td className="px-4 py-3 border-t">{c.date || ''}</td>
                          {isEditMode && (
                            <td className="px-4 py-3 border-t text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteCredit(c)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                                title="Delete this credit record"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
            >
              Cancel
            </button>
            {isEditMode && (
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#6a1a12] text-white rounded-md hover:bg-[#5a1510] transition-colors focus:ring-2 focus:ring-[#6a1a12]/50 focus:outline-none font-medium"
              >
                {activeTab === 'credit' ? 'Insert Credit' : 'Update Return'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Returnmodel;