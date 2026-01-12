import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Search, Pencil } from "lucide-react";
import Swal from 'sweetalert2';
import Pagination from "../../components/pagination/pagenation";
import { getCase, updateCase, wherhousePerson } from "../../service/admin/caseUpdate";
import CaseUpdateModal from "../../models/admin/caseupdate/caseUpdatedModel";

const CaseUpdate = () => {
  // State for data and pagination
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    searchTerm: "",
    hasBoxes: null // null = all, true = updated, false = non-updated
  });

  // Debounce state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Warehouse persons state
  const [warehousePersons, setWarehousePersons] = useState([]);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);

  // Fetch warehouse persons
  const fetchWarehousePersons = async () => {
    setLoadingWarehouse(true);
    try {
      const response = await wherhousePerson();
      const persons = response?.data?.data || [];
      setWarehousePersons(persons);
    } catch (err) {
      console.error("Error fetching warehouse persons:", err);
      setWarehousePersons([]);
    } finally {
      setLoadingWarehouse(false);
    }
  };

  // Fetch data from API - useCallback for memoization
  const fetchCases = useCallback(async (page = 1, limit = recordsPerPage, hasBoxesFilter = null, search = "") => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: page,
        limit: limit,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(search && { search: search }),
        ...(hasBoxesFilter !== null && { hasBoxes: hasBoxesFilter.toString() })
      };
      
      const response = await getCase(params);
      console.log('API Response:', response);

      const responseData = response?.data?.data || [];
      const paginationInfo = response?.data?.pagination || {};
      
      setTableData(responseData);
      setTotalRecords(paginationInfo.total || responseData.length);
      setTotalPages(paginationInfo.totalPages || Math.ceil((paginationInfo.total || responseData.length) / limit));
      setCurrentPage(paginationInfo.page || page);
      
    } catch (err) {
      setError("Failed to fetch cases. Please try again.");
      console.error("Error fetching cases:", err);
      setTableData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, recordsPerPage]);

  // Handle Non Updated button click
  const handleNonUpdatedClick = () => {
    setFilters(prev => ({
      ...prev,
      hasBoxes: false,
      searchTerm: "" // Clear search when switching tabs
    }));
    setDebouncedSearchTerm("");
    fetchCases(1, recordsPerPage, false, "");
  };

  // Handle Updated button click
  const handleUpdatedClick = () => {
    setFilters(prev => ({
      ...prev,
      hasBoxes: true,
      searchTerm: "" // Clear search when switching tabs
    }));
    setDebouncedSearchTerm("");
    fetchCases(1, recordsPerPage, true, "");
  };

  // Handle Show All button
  const handleShowAllClick = () => {
    setFilters(prev => ({
      ...prev,
      hasBoxes: null,
      searchTerm: "" // Clear search when switching tabs
    }));
    setDebouncedSearchTerm("");
    fetchCases(1, recordsPerPage, null, "");
  };

  // Handle edit button click
  const handleEditClick = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCase(null);
  };

  // Handle update
  const handleUpdate = async (updatedData) => {
    try {
      console.log("Updating case:", updatedData);
      
      // Show loading alert
      Swal.fire({
        title: 'Updating...',
        text: 'Please wait while we update the case',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Call the update API
      await updateCase(
        updatedData.sales_id, 
        updatedData.no_of_cases, 
        updatedData.warehouse_person 
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Case updated successfully!',
        confirmButtonColor: '#f43f5e',
        timer: 2000,
        showConfirmButton: false
      });
      
      handleCloseModal();
      
      // Refresh data with current filter and search term
      fetchCases(1, recordsPerPage, filters.hasBoxes, filters.searchTerm);
      
    } catch (err) {
      console.error("Error updating case:", err);
      
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update case. Please try again.',
        confirmButtonColor: '#f43f5e'
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCases();
    fetchWarehousePersons();
  }, [fetchCases]);

  // Handle records per page change
  const handleRecordsPerPageChange = (value) => {
    const newRecordsPerPage = parseInt(value);
    setRecordsPerPage(newRecordsPerPage);
    fetchCases(1, newRecordsPerPage, filters.hasBoxes, filters.searchTerm);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchCases(newPage, recordsPerPage, filters.hasBoxes, filters.searchTerm);
  };

  // Handle get report (refresh data)
  const handleGetReport = () => {
    fetchCases(1, recordsPerPage, filters.hasBoxes, filters.searchTerm);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If changing date filters, trigger immediate search
    if (field === 'startDate' || field === 'endDate') {
      fetchCases(1, recordsPerPage, filters.hasBoxes, filters.searchTerm);
    }
  };

  // Handle search input change with debounce
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    
    // Update the immediate state
    setFilters(prev => ({
      ...prev,
      searchTerm: value
    }));
    
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set new timeout for debouncing
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 500); // 500ms debounce delay
    
    setDebounceTimeout(timeout);
  };

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      fetchCases(1, recordsPerPage, filters.hasBoxes, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, fetchCases]);

  // Clear search
  const handleClearSearch = () => {
    setFilters(prev => ({
      ...prev,
      searchTerm: ""
    }));
    setDebouncedSearchTerm("");
    fetchCases(1, recordsPerPage, filters.hasBoxes, "");
  };

  // Check if a case is updated (has no_of_cases)
  const isCaseUpdated = (caseItem) => {
    return caseItem.no_of_cases && caseItem.no_of_cases > 0;
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return (
    <div className="w-full p-4 ">
      <h2 className="text-xl font-semibold text-gray-700">
        CASE UPDATE
      </h2>

      {/* 🔹 Filter Section Card */}
      <div className="bg-white p-6 shadow-sm rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* START DATE */}
          <div>
            <label className="text-sm text-gray-600">START DATE</label>
            <div className="relative mt-1">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 pr-10 py-2 
                           focus:ring-2 focus:ring-gray-200 outline-none"
              />
             
            </div>
          </div>

          {/* END DATE */}
          <div>
            <label className="text-sm text-gray-600">END DATE</label>
            <div className="relative mt-1">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 pr-10 py-2 
                           focus:ring-2 focus:ring-gray-200 outline-none"
              />
             
            </div>
          </div>

          {/* RECORD PER PAGE + GET REPORT BUTTON */}
          <div className="flex items-end gap-3">
            <div className="w-full">
              <label className="text-sm text-gray-600">RECORDS PER/PAGE</label>
              <select 
                value={recordsPerPage}
                onChange={(e) => handleRecordsPerPageChange(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 
                           focus:ring-2 focus:ring-gray-200 outline-none"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="150">150</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>

            <button 
              onClick={handleGetReport}
              disabled={loading}
              className=" bg-[#6a1a12] text-white px-6  rounded-md 
                         hover:bg-[#955d5d] transition  disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Get Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 🔥 Search + Buttons + Table ALL IN ONE CARD */}
      <div className="bg-white p-6 shadow-sm rounded-md space-y-6">
        {/* Search + Buttons Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Form - Auto search with debounce */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden w-full md:w-auto">
            <div className="relative flex items-center w-full">
              <Search size={18} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice, customer, or company..."
                value={filters.searchTerm}
                onChange={handleSearchInputChange}
                className="px-10 py-2 focus:outline-none w-full md:w-80"
              />
              {filters.searchTerm && (
                <button 
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleShowAllClick}
              className={`px-6 py-2 rounded-md transition ${
                filters.hasBoxes === null 
                  ? 'bg-[#6a1a12] text-white' 
                  : 'bg-[#6a1a12] text-white hover:bg-[#955d5d]'
              }`}
            >
              All Cases
            </button>
            <button 
              onClick={handleNonUpdatedClick}
              className={`px-6 py-2 rounded-md transition ${
                filters.hasBoxes === false 
                  ? 'bg-[#6a1a12] text-white' 
                  : 'bg-[#6a1a12] text-white hover:bg-[#955d5d]'
              }`}
            >
              Non Updated
            </button>
            <button 
              onClick={handleUpdatedClick}
              className={`px-6 py-2 rounded-md transition ${
                filters.hasBoxes === true 
                  ? 'bg-[#6a1a12] text-white' 
                  : 'bg-[#6a1a12] text-white hover:bg-[#955d5d]'
              }`}
            >
              Updated
            </button>
          </div>
        </div>

        {/* Search Status */}
        {filters.searchTerm && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-blue-500" />
              <span className="text-sm text-blue-700">
                Searching for: <strong>"{filters.searchTerm}"</strong>
                {loading && <span className="ml-2">(Searching...)</span>}
              </span>
            </div>
            <button 
              onClick={handleClearSearch}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400"></div>
            <p className="mt-2 text-gray-600">Loading ...</p>
          </div>
        )}

        {/* Table Section */}
        {!loading && (
          <div className="relative rounded-xl shadow-sm border border-gray-200 mt-4">
            <div className="overflow-x-auto overflow-y-auto max-h-[550px] scrollbar-hide">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">SNO</th>
                  <th className="p-3 text-left">INVOICE NO</th>
                  <th className="p-3 text-left">CUSTOMER NAME</th>
                  <th className="p-3 text-left">COMPANY NAME</th>
                  <th className="p-3 text-left">INVOICE DATE</th>
                  <th className="p-3 text-left">NO OF CASES</th>
                
                  <th className="p-3 text-left">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((item, index) => (
                    <tr key={item.sales_id || index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-xs  left-0 bg-white z-10 font-medium">
                        {(currentPage - 1) * recordsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-xs">{item.invoice_no}</td>
                      <td className="px-4 py-2 border border-gray-200 text-xs">{item.customer_name}</td>
                      <td className="px-4 py-2 border border-gray-200 text-xs">{item.company_name}</td>
                      <td className="px-4 py-2 border border-gray-200 text-xs">{item.invoice_date}</td>
                      <td className="px-4 py-2 border border-gray-200 text-xs">
                        {isCaseUpdated(item) ? item.no_of_cases : "-"}
                      </td>
                     
                      <td className="px-4 py-2 border border-gray-200 text-xs">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-[#842626] hover:text-red-700 transition"
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-3 py-4 border text-center text-gray-500">
                      {filters.searchTerm || filters.hasBoxes !== null 
                        ? "No cases found matching your criteria" 
                        : "No cases found"
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {/* Pagination Component - Only show if we have data */}
        {!loading && totalRecords > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            showInfo={true}
            showFirstLast={true}
            showPrevNext={true}
            showPageNumbers={true}
            className="mt-6"
          />
        )}
      </div>

      {/* Case Update Modal */}
      <CaseUpdateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseData={selectedCase}
        onUpdate={handleUpdate}
        warehousePersons={warehousePersons}
        loadingWarehouse={loadingWarehouse}
      />
    </div>
  );
};

export default CaseUpdate;