import React, { useState, useEffect } from "react";
import LrUpdateable from "../../components/employee/LrTable/LrUbdateTable";
import { useAuth } from "../../contexts/AuthContext";
import { getLrData, deleteLr, updateLr, getExportCurrentUrl, getExportFullUrl, clubInvoiceLr, caseUpdate } from "../../service/employee/lrApi";
import Swal from "sweetalert2";

export default function LrUpdateReport() {
  const { auth } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  

  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState(null);
  
  // ✅ Add a state to track if user has access to company filters
  const [showCompanyFilters, setShowCompanyFilters] = useState(false);
  
  // ✅ Define company IDs that should see the filter buttons
  const ALLOWED_COMPANY_IDS = ['VED_2f5700a7', 'CHA_3554bf96'];

  // ✅ Company ID mappings
  const COMPANY_MAPPINGS = {
    'VED_2f5700a7': 'Vedistry Pvt Ltd',
    'CHA_3554bf96': 'Charak Pharma Pvt Ltd'
  };

  // ✅ Check if current company should see the filter buttons
  useEffect(() => {
    if (auth.company?.id) {
      setShowCompanyFilters(ALLOWED_COMPANY_IDS.includes(auth.company.id));
    }
  }, [auth.company?.id]);

  // ✅ Function to get company IDs based on selected filter
  const getCompanyIdsForFilter = () => {
    // If no filter is selected, return the logged-in company ID
    if (!selectedCompanyFilter) {
      return auth.company?.id;
    }
    
    // If "Charak Pharma + Vedistry Pvt Ltd" is selected
    if (selectedCompanyFilter === 'Charak Pharma + Vedistry Pvt Ltd') {
      // Return both company IDs
      return ['CHA_3554bf96', 'VED_2f5700a7'];
    }
    
    // If specific company is selected
    // Find the ID for the selected company name
    const companyEntry = Object.entries(COMPANY_MAPPINGS).find(
      ([id, name]) => name === selectedCompanyFilter
    );
    
    return companyEntry ? companyEntry[0] : auth.company?.id;
  };

  // ✅ புதிய function: Case Split Up data-ஐ update செய்ய
  const handleCaseSplitUpSave = async (updatedData) => {
    try {
      
      // Prepare the data for API call
      const apiData = {
        reference: updatedData?.reference || updatedData?._raw?.reference || "",
        sales_id: updatedData?.sales_id || updatedData?._raw?.sales_id || ""
      };
      
      // Add the updated values
      if (updatedData.conduit !== undefined) apiData.conduit = updatedData.conduit;
      if (updatedData.cables !== undefined) apiData.cables = updatedData.cables;
      if (updatedData.others !== undefined) apiData.others = updatedData.others;
      if (updatedData.stabilizer !== undefined) apiData.stabilizer = updatedData.stabilizer;
      if (updatedData.water_heater !== undefined) apiData.water_heater = updatedData.water_heater;

      
      // Call the API
      const response = await caseUpdate(apiData);
      
      if (response.success) {
       
        updateTableDataLocally(updatedData);
        
        // Success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Case Split Up data updated successfully!',
          confirmButtonColor: '#842626',
          timer: 1500
        });
        
        return response;
      } else {
        throw new Error(response.message || "Failed to update");
      }
    } catch (error) {
      console.error("❌ Error in handleCaseSplitUpSave:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: 'Failed to save data. Please try again.',
        confirmButtonColor: '#842626'
      });
      throw error;
    }
  };

  const updateTableDataLocally = (updatedData) => {
    setTableData(prevData => 
      prevData.map(item => {
        // Match based on invoice number or reference
        const matchInvoiceNo = item.invoiceNo === updatedData.invoiceNo;
        const matchReference = item.reference === updatedData.reference;
        const matchRawReference = item._raw?.reference === updatedData.reference;
        
        if (matchInvoiceNo || matchReference || matchRawReference) {
          
          // Create updated item
          const updatedItem = { 
            ...item,
            _raw: {
              ...item._raw,
              ...updatedData
            }
          };
          
          // Update specific fields in the main item (not just in _raw)
          if (updatedData.conduit !== undefined) {
            updatedItem.conduit = updatedData.conduit;
          }
          if (updatedData.cables !== undefined) {
            updatedItem.cables = updatedData.cables;
          }
          if (updatedData.others !== undefined) {
            updatedItem.others = updatedData.others;
          }
          if (updatedData.stabilizer !== undefined) {
            updatedItem.stabilizer = updatedData.stabilizer;
          }
          if (updatedData.water_heater !== undefined) {
            updatedItem.waterHeater = updatedData.water_heater;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
    
  };

  // Fetch data function in parent component - Updated with company filter
  const fetchData = async (page = 1) => {
    try {
      if (!auth.company?.id) return;
      
      setLoading(true);
      setError(null);

      // Get company IDs based on filter
      const companyIds = getCompanyIdsForFilter();
      
      const params = {
        companyId: companyIds, // Can be string or array
        page,
        limit: recordsPerPage,
        startDate,
        endDate,
        search: searchTerm,
        // ✅ Add company filter parameter for tracking
        companyFilter: selectedCompanyFilter
      };
      
      console.log("Fetching data with params:", params);
      console.log("Logged in company: ", auth.company.id, ", name: ", auth.company.name);

      const res = await getLrData(params);
      console.log("GET LR with filter: ", res);
      
      const rows = res?.data?.data || [];

      const formatted = rows.map((item, index) => {
        const caseSplitUp =
          item["Case Split-up"] ||
          item.caseSplitUp ||
          item["Case split-up"] ||
          "";

        // Use clubbed_from field directly if available, otherwise parse caseSplitUp
        const parseInvoiceNumbers = () => {
          if (item.clubbed_from) {
            try {
              if (typeof item.clubbed_from === 'string') {
                return JSON.parse(item.clubbed_from);
              }
              return item.clubbed_from;
            } catch (e) {
              console.error("Error parsing clubbed_from:", e);
            }
          }
          
          if (!caseSplitUp) return [];
          try {
            if (caseSplitUp.startsWith("[") && caseSplitUp.endsWith("]")) {
              return JSON.parse(caseSplitUp);
            }
            return caseSplitUp
              .split(/[,|;]/)
              .map((s) => s.trim().replace(/[""]/g, ""))
              .filter(Boolean);
          } catch (e) {
            console.error("Error parsing case split-up:", e);
            return caseSplitUp
              .split(/[,|;]/)
              .map((s) => s.trim().replace(/[""]/g, ""))
              .filter(Boolean);
          }
        };

        const invoiceNumbers = parseInvoiceNumbers();
        
        // FIX: Properly extract clubedBoxes with all possible field names
        const clubedBoxes = 
          item["Clubed Boxes"] || // From API response
          item["Clubed boxes"] ||
          item.clubedBoxes ||
          item.ClobedBoxes ||
          item["Clubbed Boxes"] ||
          0;

        return {
          id: item.id || item.sno || `row-${index}-${Date.now()}`,
          sno: item.sno || index + 1 + (page - 1) * recordsPerPage,
          selected: false, // Add selected field for checkbox
          created: item.Created || item.created || "",
          courierNo:
            item["Courier no"] ||
            item.courierNo ||
            item["Lr no"] ||
            item.lrNo ||
            "",
          transportName:
            item["Transport Name"] ||
            item.transportName ||
            item["Transport name"] ||
            "",
          companyName: item["Company name"] || item.companyName || "",
          companyId: item["companyId"] || item.companyId || "",
          customerName: item["Customer name"] || item.customerName || "",
          customerCity:
            item["Customer city"] ||
            item.customerCity ||
            item["Current city"] ||
            "",
          regularBoxes: item["Regular boxes"] || item.regularBoxes || 0,
          clubedBoxes: clubedBoxes, // Use the properly extracted value
          caseSplitUp: caseSplitUp,
          weight: item.Weight || item.weight || "",
          invoiceNo: item["Invoice no"] || item.invoiceNo || "",
          invoiceDate: item["Invoice date"] || item.invoiceDate || "",
          invoiceValue: item["Invoice value"] || item.invoiceValue || "",
          lrNo: item["Lr no"] || item.lrNo || item["Courier no"] || "",
          lrDate: item["Lr date"] || item.lrDate || item["booking_date"] || item?.booking_date || "",
          chequeNo: item["Cheque no"] || item.chequeNo || "",
          chequeDate: item["Cheque date"] || item.chequeDate || "",
          comments: item.Comments || item.comments || "",
          invoiceNumbers: invoiceNumbers,
          _raw: item,
          customerId: item.customer_id || item.customerId || "",
          eway_bill_no: item.eway_bill_no || "",
          status: item.status || 0,
          vehicle_no: item.vehicle_no || "",
          warehouse_id: item.warehouse_id || "",
          agent_id: item.agent_id || "",
          chq_received_time: item.chq_received_time || "",
          delivered_time: item.delivered_time || "",
          delivery_person_id: item.delivery_person_id || "",
          driver_id: item.driver_id || "",
          out_time: item.out_time || "",
          packed_time: item.packed_time || "",
          reference: item.Reference || item.reference || item["Reference"] || "", // Add reference for modal
          sales_id: item.sales_id || "",
          // ✅ Add Case Split Up fields for immediate display
          conduit: item.conduit || 0,
          cables: item.cables || 0,
          others: item.others || 0,
          stabilizer: item.stabilizer || 0,
          waterHeater: item.water_heater || 0,
        };
      });

      setTableData(formatted);
      setCurrentPage(res?.data?.currentPage || page);
      setTotalPages(res?.data?.totalPages || 1);
      setTotalRecords(res?.data?.totalRecords || 0);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  
  const handleCompanyFilterClick = (filterName) => {
    if (selectedCompanyFilter === filterName) {
     
      setSelectedCompanyFilter(null);
    } else {
    
      console.log("FiltNAme: ",selectedCompanyFilter);
      
      setSelectedCompanyFilter(filterName);
    }
    setCurrentPage(1); 
  };

  // Get display name for the filter
  const getFilterDisplayName = () => {
    if (!selectedCompanyFilter) return null;
    
    if (selectedCompanyFilter === 'Charak Pharma + Vedistry Pvt Ltd') {
      return 'Both Companies (Charak + Vedistry)';
    }
    
    return selectedCompanyFilter;
  };

  // Delete function in parent component
  const handleDelete = async (row) => {
    
    const result = await Swal.fire({
      title: `Delete ${row.customerName}?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: 'rounded-lg shadow-lg',
        confirmButton: 'rounded-lg',
        cancelButton: 'rounded-lg'
      }
    });

    if (result.isConfirmed) {
      try {
        const params = {
          sales_id:row.sales_id
        };

        const res = await deleteLr(params);


        Swal.fire({
          title: "Deleted!",
          text: "The LR record has been deleted.",
          icon: "success",
          customClass: {
            popup: 'rounded-lg shadow-lg',
            confirmButton: 'rounded-lg'
          }
        });

        // Refresh data after delete
        fetchData(currentPage);
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the record.",
          icon: "error",
          customClass: {
            popup: 'rounded-lg shadow-lg',
            confirmButton: 'rounded-lg'
          }
        });
      }
    }
  };

  // Edit function in parent component
  const handleEdit = async (updateData) => {
    try {

      const response = await updateLr(updateData);


      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Record has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh data after edit
      fetchData(currentPage);
      
      return response;
    } catch (err) {
      console.error("Error updating LR:", err);
      throw new Error(err.response?.data?.message || "Failed to update record");
    }
  };

  // Select All/Deselect All function
  const handleSelectAll = (isSelected) => {
    setTableData(prevData => 
      prevData.map(item => ({
        ...item,
        selected: isSelected
      }))
    );
  };

  // Individual checkbox toggle function
  const handleSelectItem = (id, isSelected) => {
    setTableData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, selected: isSelected } : item
      )
    );
  };

  // Get selected items function
  const getSelectedItems = () => {
    return tableData.filter(item => item.selected);
  };

  // VALIDATION: Check if all selected items have same companyId and customerId
  const validateClubbing = (selectedItems) => {
    if (selectedItems.length === 0) {
      return {
        isValid: false,
        message: "Please select at least one item to perform clubbing action."
      };
    }

    if (selectedItems.length === 1) {
      return {
        isValid: false,
        message: "Please select at least two items for clubbing."
      };
    }

    

    // Check if all selected items have same customerId
    const firstCustomerId = selectedItems[0].customerId;
    const sameCustomer = selectedItems.every(item => item.customerId === firstCustomerId);
    
    if (!sameCustomer) {
      return {
        isValid: false,
        message: "All selected items must belong to the same customer for clubbing."
      };
    }

    return {
      isValid: true,
      message: "Validation successful! Items can be clubbed.",

      customerId: firstCustomerId
    };
  };

  // Fetch data when dependencies change - selectedCompanyFilter-ஐயும் சேர்க்கவும்
  useEffect(() => {
    fetchData(1);
  }, [searchTerm, startDate, endDate, recordsPerPage, auth.company?.id, selectedCompanyFilter]);

  const triggerDownload = (url, fileName) => {
    try {
      Swal.fire({
        title: "Preparing download...",
        text: "Please wait a moment",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      setTimeout(() => {
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
          icon: "success",
          title: "Download Successful 🎉",
          text: `${fileName} has been downloaded.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }, 800);
    } catch (err) {
      console.error("Download failed:", err);
      Swal.fire({
        icon: "error",
        title: "Download Failed ❌",
        text: "Something went wrong while downloading.",
      });
    }
  };

  const exportCurrentPage = () => {
    if (!auth.company?.id) {
      Swal.fire("⚠️ Select Company", "Please select a company first", "warning");
      return;
    }

    const companyIds = getCompanyIdsForFilter();
    
    const params = {
      companyId: companyIds,
      page: currentPage,
      limit: recordsPerPage,
      startDate,
      endDate,
      search: searchTerm,
      companyFilter: selectedCompanyFilter // ✅ filter-ஐயும் சேர்க்கவும்
    };

    const downloadUrl = getExportCurrentUrl(params);
    triggerDownload(downloadUrl, "lr_current_page.xlsx");
  };

  const exportAllData = () => {
    if (!auth.company?.id) {
      Swal.fire("⚠️ Select Company", "Please select a company first", "warning");
      return;
    }

    const companyIds = getCompanyIdsForFilter();
    
    const params = {
      companyId: companyIds,
      startDate,
      endDate,
      search: searchTerm,
      companyFilter: selectedCompanyFilter // ✅ filter-ஐயும் சேர்க்கவும்
    };

    const downloadUrl = getExportFullUrl(params);
    triggerDownload(downloadUrl, "lr_full_report.xlsx");
  };

  // Handle page change from child
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page);
  };

  const handleClubed = () => {
    const selectedItems = getSelectedItems();

    
    // Validate clubbing
    const validation = validateClubbing(selectedItems);
    
    if (!validation.isValid) {
      Swal.fire({
        icon: "warning",
        title: "Validation Failed",
        text: validation.message,
        confirmButtonColor: "#842626",
      });
      return;
    }

    // Calculate initial clubbed boxes value (sum of regular boxes)
    const initialClubbedBoxes = selectedItems.reduce((sum, item) => sum + (parseInt(item.regularBoxes) || 0), 0);

    // Create custom modal with input box
    Swal.fire({
      icon: "success",
      title: "Validation Successful!",
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Ready to Club ${selectedItems.length} Items:</strong></p>
          <div class="max-h-40 overflow-y-auto mb-3">
            ${selectedItems.map(item => `
              <div class="border-b py-1 text-sm">
                <strong>${item.invoiceNo}</strong> - ${item.customerName} - ${formatCurrency(item.invoiceValue)}
              </div>
            `).join('')}
          </div>
          <div class="bg-green-50 p-2 rounded mb-3">
             <p class="text-sm"><strong>Company:</strong> ${selectedItems[0].companyName}</p>
            <p class="text-sm"><strong>Customer:</strong> ${selectedItems[0].customerName}</p>
            <p class="text-sm"><strong>Total Regular Boxes:</strong> ${selectedItems[0].clubedBoxes}</p>
          </div>
          
          <!-- Input box for Clubbed Boxes -->
          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Clubbed Boxes:
            </label>
            <input 
              type="number" 
              id="clubbedBoxesInput" 
              value="${selectedItems[0].clubedBoxes}"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6a1a13] focus:border-transparent"
              placeholder="Enter clubbed boxes count"
            />
            <p class="text-xs text-gray-500 mt-1">
              Enter the total boxes after clubbing
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Proceed with Clubbing",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#842626",
      cancelButtonColor: "#6b7280",
      showCloseButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const inputValue = document.getElementById('clubbedBoxesInput').value;
        if (!inputValue || isNaN(inputValue) || parseInt(inputValue) <= 0) {
          Swal.showValidationMessage('Please enter a valid number for clubbed boxes');
          return false;
        }
        return parseInt(inputValue);
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const clubbedBoxesValue = result.value;

        
        // Call performClubbing with the input value
        performClubbing(selectedItems, validation.companyId, validation.customerId, clubbedBoxesValue);
      }
    });
  };

  // Perform actual clubbing operation
  const performClubbing = async (selectedItems, companyId, customerId, clubbedBoxes) => {
    try {
      // Prepare data for clubbing API call
      const clubbingData = {
        companyId: auth.company.id,
        customerId: customerId,
        selectedItems: selectedItems,
        clubedBoxes: clubbedBoxes  // Use the value from input
      };



      // Call clubbing API
      const response = await clubInvoiceLr(clubbingData);

      Swal.fire({
        icon: "success",
        title: "Clubbing Successful! 🎉",
        html: `
          <div class="text-left">
            <p><strong>${selectedItems.length} invoices have been clubbed successfully!</strong></p>
            <p class="mt-2">Clubbed Boxes: <strong>${clubbedBoxes}</strong></p>
            <div class="mt-2 text-sm">
              ${selectedItems.map(item => `<div>✓ ${item.invoiceNo}</div>`).join('')}
            </div>
          </div>
        `,
        confirmButtonColor: "#842626",
      });

      // Refresh data after successful clubbing
      fetchData(currentPage);

    } catch (error) {
      console.error("❌ Clubbing failed:", error);
      
      let errorMessage = "Failed to club the selected items. Please try again.";
      
      if (error.message.includes("sales_id not found")) {
        errorMessage = "Sales ID not found in the data. Please contact support.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Clubbing Failed",
        text: errorMessage,
        confirmButtonColor: "#842626",
      });
    }
  };

  // Format currency for display in alert
  const formatCurrency = (value) => {
    if (!value) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="p-2 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-bold text-gray-400 mb-2">
        LR UPDATE REPORT
      </h2>
      
      <div className="sticky top-0 z-20 bg-gray-100 p-2 shadow-xl border border-none rounded-lg">
        {/* ✅ Conditionally render Company Filter Buttons */}
        {showCompanyFilters && (
          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Company:
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Charak Pharma + Vedistry Pvt Ltd Button - Shows data from both companies */}
              <button 
                onClick={() => handleCompanyFilterClick('Charak Pharma + Vedistry Pvt Ltd')}
                className={`px-4 py-2 text-sm font-semibold rounded-md shadow-md whitespace-nowrap transition-colors ${
                  selectedCompanyFilter === 'Charak Pharma + Vedistry Pvt Ltd' 
                    ? 'bg-[#6a1a13] text-white' 
                    : 'bg-[#842626] hover:bg-amber-950 text-white'
                }`}
              >
                Charak Pharma + Vedistry Pvt Ltd
              </button>
              
              {/* Individual company buttons - only show if logged into that company */}
              {auth.company?.id === 'CHA_3554bf96' && (
                <button 
                  onClick={() => handleCompanyFilterClick('Charak Pharma Pvt Ltd')}
                  className={`px-4 py-2 text-sm font-semibold rounded-md shadow-md whitespace-nowrap transition-colors ${
                    selectedCompanyFilter === 'Charak Pharma Pvt Ltd' 
                      ? 'bg-[#6a1a13] text-white' 
                      : 'bg-[#842626] hover:bg-amber-950 text-white'
                  }`}
                >
                  Charak Pharma Only
                </button>
              )}
              
              {auth.company?.id === 'VED_2f5700a7' && (
                <button 
                  onClick={() => handleCompanyFilterClick('Vedistry Pvt Ltd')}
                  className={`px-4 py-2 text-sm font-semibold rounded-md shadow-md whitespace-nowrap transition-colors ${
                    selectedCompanyFilter === 'Vedistry Pvt Ltd' 
                      ? 'bg-[#6a1a13] text-white' 
                      : 'bg-[#842626] hover:bg-amber-950 text-white'
                }`}
                >
                  Vedistry Only
                </button>
              )}
              
              {/* ✅ Clear Filter Button */}
              {selectedCompanyFilter && (
                <button 
                  onClick={() => setSelectedCompanyFilter(null)}
                  className="px-4 py-2 text-sm font-semibold bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-md whitespace-nowrap"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Filter Info - also conditionally render */}
        {showCompanyFilters && selectedCompanyFilter && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <span className="text-blue-700 font-medium">
                Currently showing data for: 
              </span>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {getFilterDisplayName()}
              </span>
              <span className="ml-2 text-sm text-blue-600">
                {selectedCompanyFilter === 'Charak Pharma + Vedistry Pvt Ltd' 
                  ? '(Both Companies)' 
                  : `(Logged in: ${auth.company?.name})`}
              </span>
            </div>
          </div>
        )}

        {/* Filters + Export - Match the image layout */}
        <div className="flex flex-wrap items-end gap-4 mb-2">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
              <legend className="text-xs text-gray-800 px-1">SEARCH</legend>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-gray-700 focus:outline-none"
              />
            </fieldset>
          </div>

          {/* Start Date */}
          <div className="flex-1 min-w-[180px]">
            <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
              <legend className="text-xs text-gray-800 px-1">START DATE</legend>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-gray-700 focus:outline-none"
              />
            </fieldset>
          </div>

          {/* End Date */}
          <div className="flex-1 min-w-[180px]">
            <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
              <legend className="text-xs text-gray-800 px-1">END DATE</legend>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-gray-700 focus:outline-none"
              />
            </fieldset>
          </div>

          {/* Records per page */}
          <div className="flex-1 min-w-[200px]">
            <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
              <legend className="text-xs text-gray-800 px-1">RECORDS PER PAGE</legend>
              <select
                value={recordsPerPage}
                onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                className="w-full text-gray-700 focus:outline-none"
              >
                <option value={50}>50 (default)</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </fieldset>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button 
              onClick={exportCurrentPage}
              className="bg-[#842626] hover:bg-amber-950 text-white text-sm font-semibold rounded-md px-6 py-2 shadow-md whitespace-nowrap"
            >
              Export Page
            </button>
            <button 
              onClick={exportAllData}
              className="bg-[#842626] hover:bg-amber-950 text-white text-sm font-semibold rounded-md px-6 py-2 shadow-md whitespace-nowrap"
            >
              Export All
            </button>
            <button 
              onClick={handleClubed}
              className="bg-[#842626] hover:bg-amber-950 text-white text-sm font-semibold rounded-md px-6 py-2 shadow-md whitespace-nowrap"
            >
              Club
            </button>
          </div>
        </div>
      </div>
      
      {/* Selected Items Info */}
      {getSelectedItems().length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-none border-rose-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-300 font-medium">
                {getSelectedItems().length} items selected
              </span>
              <span className="ml-3 text-sm text-red-400">
                (Company: {getSelectedItems()[0].companyName}, Customer: {getSelectedItems()[0].customerName})
              </span>
            </div>
            <button
              onClick={() => handleSelectAll(false)}
              className=" bg-[#6a1a13] text-white hover:bg-[#865556] p-2 border rounded-lg text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table - with onRefreshData prop added */}
      <div className="bg-gray-50 rounded-xl shadow-inner mt-4 overflow-x-auto">
        <LrUpdateable
          tableData={tableData}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
          searchTerm={searchTerm}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          auth={auth}
          onSaveCaseSplitUp={handleCaseSplitUpSave}
          onRefreshData={() => fetchData(currentPage)}  // ✅ ADDED THIS LINE - passes refresh function
        />
      </div>
    </div>
  );
}