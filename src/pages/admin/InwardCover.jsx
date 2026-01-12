import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getCustomers, getCompanies } from "../../service/admin/customerApi";
import { Pencil, Trash2 } from "lucide-react";
import Pagination from "../../components/pagination/pagenation";
import {
  getInward,
  currentExport,
  currentExportAll,
  deleteInward,
  updateInward,
} from "../../service/admin/inward";
import Swal from "sweetalert2";
import InwardCoverModal from "../../models/admin/inward/inwardCoverModel";

const InwardCover = () => {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    companyName: "",
    customerName: "",
    courierNo: "",
    recordsPerPage: "50",
  });

  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Customer search state
  // const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Company search state
  // const [companySearch, setCompanySearch] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Table data & pagination state
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updating, setUpdating] = useState(false);

  const recordsPerPage = parseInt(form.recordsPerPage) || 50;

  // Fetch customers and companies initially
  useEffect(() => {
    fetchCustomers();
    fetchCompanies();
  }, []);

  // Customer functions
  const fetchCustomers = async (searchTerm = "") => {
    try {
      setLoadingCustomers(true);
      const response = await getCustomers({ search: searchTerm });
      const data = response?.data?.data || response?.data || [];
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Company functions
  const fetchCompanies = async (searchTerm = "") => {
    try {
      setLoadingCompanies(true);
      const response = await getCompanies({ search: searchTerm });
      console.log("comp?: ", response);

      const data = response?.data?.data || response?.data || [];
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (error) {
      console.error("❌ Error fetching companies:", error);
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // 🔍 Handle customer search input change
  const handleCustomerSearchChange = (e) => {
    const value = e.target.value;
    // setCustomerSearch(value);
    setForm((prev) => ({ ...prev, customerName: value }));
    setShowCustomerDropdown(true);

    if (value.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) => {
        const searchLower = value.toLowerCase();
        const name = customer.name?.toLowerCase() || "";
        const altName = customer.customer_name?.toLowerCase() || "";
        const email = customer.email?.toLowerCase() || "";
        const phone = customer.phone || "";

        return (
          name.includes(searchLower) ||
          altName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(value)
        );
      });
      setFilteredCustomers(filtered);
    }
  };

  // 🔍 Handle company search input change
  const handleCompanySearchChange = (e) => {
    const value = e.target.value;
    // setCompanySearch(value);
    setForm((prev) => ({ ...prev, companyName: value }));
    setShowCompanyDropdown(true);

    if (value.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((company) => {
        const searchLower = value.toLowerCase();
        const name = company.name?.toLowerCase() || "";
        const companyName = company.company_name?.toLowerCase() || "";
        const email = company.email?.toLowerCase() || "";
        const phone = company.phone || "";

        return (
          name.includes(searchLower) ||
          companyName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(value)
        );
      });
      setFilteredCompanies(filtered);
    }
  };

  // ✅ Handle customer selection
  const handleCustomerSelect = (customer) => {
    const customerName = customer.name || customer.customer_name || "";
    // setCustomerSearch(customerName);
    setForm((prev) => ({
      ...prev,
      customerName: customerName,
    }));
    setShowCustomerDropdown(false);
  };

  // ✅ Handle company selection
  const handleCompanySelect = (company) => {
    const companyName =
      typeof company === "string"
        ? company
        : company.name || company.company_name || "";
    const companyId = company.id || company.company_id || "";

    // setCompanySearch(companyName);
    setForm((prev) => ({
      ...prev,
      companyName: companyName,
      companyId: companyId, // Store company ID for backend
    }));
    setShowCompanyDropdown(false);
  };

  // Handle other input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Refresh data with new page
    handleSubmit(null, page);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".customer-dropdown")) {
        setShowCustomerDropdown(false);
      }
      if (!event.target.closest(".company-dropdown")) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle form submission and show table
  const handleSubmit = async (e, page = 1) => {
    if (e) e.preventDefault();

    setLoadingTable(true);
    setShowTable(false);
    setCurrentPage(page);

    try {
      // Create params object and filter out empty values
      const params = {
        start_date: form.startDate || undefined,
        end_date: form.endDate || undefined,
        company_name: form.companyName || undefined,
        customer_name: form.customerName || undefined,
        courier_no: form.courierNo || undefined,
        limit: recordsPerPage,
        page: page,
      };

      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      console.log("Req Inward: ", params);

      const response = await getInward(params);
      console.log("Admin_Inward Response: ", response);

      // Handle different response structures
      let data = [];
      let pagination = {
        currentPage: page,
        totalPages: 1,
        totalRecords: 0,
      };

      if (Array.isArray(response)) {
        // If response is directly an array
        data = response;
        pagination.totalRecords = response.length;
      } else if (response?.data) {
        // If response has data property
        data = Array.isArray(response.data) ? response.data : [];

        // Handle pagination from response
        if (response.pagination) {
          pagination = response.pagination;
        } else {
          pagination.totalRecords = data.length;
        }
      } else if (response?.data?.data) {
        // If response has nested data property
        data = Array.isArray(response.data.data) ? response.data.data : [];
        pagination = response.data.pagination || pagination;
      }

      setTableData(data);
      setTotalPages(pagination.totalPages || 1);
      setTotalRecords(pagination.totalRecords || 0);
      setShowTable(true);
    } catch (error) {
      console.error("Error fetching inward report:", error);
      setTableData([]);
      setTotalPages(1);
      setTotalRecords(0);
      setShowTable(true); // Still show table to display "No data" message
    } finally {
      setLoadingTable(false);
    }
  };

  // Handle Edit Action - Open Modal
  const handleEdit = (item) => {
    console.log("Edit item:", item);
    setSelectedRecord(item);
    setIsModalOpen(true);
  };

  // Handle Update Action - Save from Modal
  const handleUpdate = async (updatedData) => {
    if (!selectedRecord) return;

    setUpdating(true);
    try {
      // Prepare the data for update with company_id
      const updatePayload = {
        cover_id: selectedRecord.cover_id,
        company_id: updatedData.companyId, // Add company_id for backend
        company_name: updatedData.companyName,
        customer_name: updatedData.customerName,
        customer_city: updatedData.customerCity,
        courier_no: updatedData.courierNo,
        transport_name: updatedData.transportName,
        comments: updatedData.comments,
      };

      console.log("Update payload:", updatePayload);

      const response = await updateInward(updatePayload);
      console.log("Update response:", response);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Record has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Close modal
      setIsModalOpen(false);
      setSelectedRecord(null);

      // Refresh the table data
      handleSubmit(null, currentPage);
    } catch (error) {
      console.error("❌ Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong while updating the record.",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  // Handle Delete Action
  const handleDelete = async (item) => {
    const coverId = item.cover_id;

    if (!coverId) {
      Swal.fire({
        icon: "error",
        title: "Invalid Record",
        text: "No cover ID found for this record.",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete cover ID ${coverId}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteInward({ cover_id: coverId });
          console.log("✅ Delete response:", response);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `Cover ${coverId} has been deleted.`,
            timer: 2000,
            showConfirmButton: false,
          });

          // Refresh table
          handleSubmit(null, currentPage);
        } catch (error) {
          console.error("❌ Delete error:", error);
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: "Something went wrong while deleting the record.",
          });
        }
      }
    });
  };

  // Export Current Page Data
  const handleExportCurrent = async () => {
    if (!tableData.length) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "No data available to export!",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      title: "Export Current Page?",
      text: "Do you want to download the current page data as Excel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Export",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          setExporting(true);

          const params = {
            start_date: form.startDate || undefined,
            end_date: form.endDate || undefined,
            company_name: form.companyName || undefined,
            customer_name: form.customerName || undefined,
            courier_no: form.courierNo || undefined,
            limit: recordsPerPage,
            page: currentPage,
          };

          Object.keys(params).forEach(
            (key) =>
              (params[key] === undefined || params[key] === "") &&
              delete params[key]
          );

          const url = currentExport(params);
          window.open(url, "_blank");

          Swal.fire({
            icon: "success",
            title: "Export Started!",
            text: "Your file is being downloaded.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Export Failed",
            text: "Something went wrong while exporting data.",
          });
          console.error("❌ Export Error:", error);
        } finally {
          setExporting(false);
        }
      }
    });
  };

  // Export All Data
  const handleExportAll = async () => {
    if (!tableData.length) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "No data available to export!",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      title: "Export All Data?",
      text: "This will download *all records* that match your filters (not just current page). Continue?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Export All",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          setExporting(true);

          const params = {
            start_date: form.startDate || undefined,
            end_date: form.endDate || undefined,
            company_name: form.companyName || undefined,
            customer_name: form.customerName || undefined,
            courier_no: form.courierNo || undefined,
          };

          // Remove empty or undefined keys
          Object.keys(params).forEach(
            (key) =>
              (params[key] === undefined || params[key] === "") &&
              delete params[key]
          );

          const url = currentExportAll(params);
          window.open(url, "_blank");

          Swal.fire({
            icon: "success",
            title: "Export Started!",
            text: "Your full report is being downloaded.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Export Failed",
            text: "Something went wrong while exporting all data.",
          });
          console.error("❌ Export All Error:", error);
        } finally {
          setExporting(false);
        }
      }
    });
  };

  // Generate unique key for company items
  const getCompanyKey = (company) => {
    if (typeof company === "string") return company;
    return (
      company.id || company.company_id || `${company.name}-${company.email}`
    );
  };

  // Generate unique key for customer items
  const getCustomerKey = (customer) => {
    return (
      customer.id ||
      customer.customer_id ||
      `${customer.name}-${customer.email}`
    );
  };

  return (
    <div className="flex flex-col items-center mt-2 px-4">
      {/* FORM SECTION WITH PROPER ALIGNMENT */}
      <div className="w-full max-w-full bg-white shadow-sm rounded-2xl p-2  border border-gray-100 mb-6">
        <h2 className="text-xl font-semibold text-gray-400 mb-6">
          Inward Cover Report
        </h2>

        <form
          onSubmit={(e) => handleSubmit(e, 1)}
          className="flex flex-wrap gap-4 items-end"
        >
          {/* Start Date */}
          <div className="flex-1 min-w-[150px]">
            <fieldset className="border border-gray-300 rounded-md px-3 py-2 h-16">
              <legend className="text-xs text-gray-500 px-1">START DATE</legend>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-800"
                aria-label="Start date"
              />
            </fieldset>
          </div>

          {/* End Date */}
          <div className="flex-1 min-w-[150px]">
            <fieldset className="border border-gray-300 rounded-md px-3 py-2 h-16">
              <legend className="text-xs text-gray-500 px-1">END DATE</legend>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-800"
              />
            </fieldset>
          </div>

          {/* Company Name (with dropdown) */}
          <div className="flex-1 min-w-[180px] relative company-dropdown">
            <fieldset className="border border-gray-300 rounded-md px-3 py-2 h-16">
              <legend className="text-xs text-gray-500 px-1">COMPANY NAME</legend>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleCompanySearchChange}
                onFocus={() => setShowCompanyDropdown(true)}
                className="w-full outline-none text-gray-800 bg-transparent"
                placeholder="Search company..."
              />
            </fieldset>

            {showCompanyDropdown && (
              <ul className="absolute z-50 w-full bg-white border border-gray-300 max-h-48 overflow-y-auto rounded-md shadow-lg mt-1 top-full">
                {loadingCompanies ? (
                  <li className="p-3 text-gray-500 text-sm flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Loading...
                  </li>
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company, index) => (
                    <li
                      key={getCompanyKey(company)}
                      onClick={() => handleCompanySelect(company)}
                      className={`p-3 text-sm text-gray-800 hover:bg-rose-50 cursor-pointer border-b border-gray-100 ${
                        index === filteredCompanies.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      {typeof company === "string"
                        ? company
                        : company.name || company.company_name}
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-gray-500 text-sm text-center">
                    No companies found
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Customer Name (with dropdown) */}
          <div className="flex-1 min-w-[180px] relative customer-dropdown">
            <fieldset className="border border-gray-300 rounded-md px-3 py-2 h-16">
              <legend className="text-xs text-gray-500 px-1">CUSTOMER NAME</legend>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleCustomerSearchChange}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full outline-none text-gray-800 bg-transparent"
                placeholder="Search customer..."
              />
            </fieldset>

            {showCustomerDropdown && (
              <ul className="absolute z-50 w-full bg-white border border-gray-300 max-h-48 overflow-y-auto rounded-md shadow-lg mt-1 top-full">
                {loadingCustomers ? (
                  <li className="p-3 text-gray-500 text-sm flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Loading...
                  </li>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, index) => (
                    <li
                      key={getCustomerKey(customer)}
                      onClick={() => handleCustomerSelect(customer)}
                      className={`p-3 text-sm text-gray-800 hover:bg-rose-50 cursor-pointer border-b border-gray-100 ${
                        index === filteredCustomers.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      {customer.name || customer.customer_name}
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-gray-500 text-sm text-center">
                    No customers found
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Courier No */}
          <div className="flex-1 min-w-[120px]">
            <fieldset className="border border-gray-300 rounded-md px-3 py-2 h-16">
              <legend className="text-xs text-gray-500 px-1">COURIER NO</legend>
              <input
                type="text"
                name="courierNo"
                value={form.courierNo}
                onChange={handleChange}
                className="w-full outline-none text-gray-800 bg-transparent"
              />
            </fieldset>
          </div>

          {/* Records per Page */}
          <div className="w-[140px]">
            <fieldset className="border border-gray-300 rounded-md px-3 py-2 h-16">
              <legend className="text-xs text-gray-500 px-1">RECORDS PER PAGE</legend>
              <select
                name="recordsPerPage"
                value={form.recordsPerPage}
                onChange={handleChange}
                className="w-full outline-none bg-transparent"
              >
                <option value="25">25</option>
                <option value="50">50 (default)</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </fieldset>
          </div>

          {/* Submit Button */}
          <div className="w-[120px]">
            <button
              type="submit"
              disabled={loadingTable}
              className="w-full bg-[#842626] hover:bg-[#955d5d] text-white py-2 rounded-md transition disabled:bg-rose-300 h-10"
            >
              {loadingTable ? "Loading..." : "Get Report"}
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      {showTable && (
        <div className="min-w-full bg-white shadow-sm rounded-2xl p-4 border border-gray-100">
          {/* Export Buttons */}
          {tableData.length > 0 && (
            <div className="flex justify-end gap-4 mb-4">
              <button
                onClick={handleExportCurrent}
                disabled={exporting}
                className="bg-[#842626] text-xs hover:bg-[#955d5d] text-white px-4 py-2 rounded-md shadow-sm transition disabled:bg-green-300 flex items-center gap-2"
              >
                {exporting ? "Exporting..." : "Export Current"}
              </button>
              <button
                onClick={handleExportAll}
                disabled={exporting}
                className="bg-[#842626] text-xs hover:bg-[#955d5d] text-white px-4 py-2 rounded-md shadow-sm transition disabled:bg-blue-300 flex items-center gap-2"
              >
                {exporting ? "Exporting..." : "Export All"}
              </button>
            </div>
          )}

          {/* Scrollable table container */}
          <div className="relative overflow-hidden rounded-lg border border-gray-200">
            {/* Horizontal and vertical scroll wrapper */}
            <div className="overflow-x-auto">
              {/* Table with fixed header and scrollable body */}
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto"> {/* Adjust height dynamically */}
                <table className="min-w-full border-collapse text-gray-700">
                  {/* Fixed Header */}
                  <thead className="sticky top-0 z-20 bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 sticky left-0 bg-gray-50 z-30 min-w-[80px]">
                        S.NO
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 sticky left-[80px] bg-gray-50 z-30 min-w-[100px]">
                        ACTIONS
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 min-w-[120px]">
                        CREATED
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 min-w-[180px]">
                        COMPANY NAME
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 min-w-[180px]">
                        CUSTOMER NAME
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 min-w-[150px]">
                        CUSTOMER CITY
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 min-w-[150px]">
                        COURIER NO
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 min-w-[180px]">
                        TRANSPORT NAME
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 min-w-[200px]">
                        COMMENTS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr
                        key={row.id || `row-${index}`}
                        className="hover:bg-gray-50"
                      >
                        {/* Sticky S.NO column */}
                        <td className="border border-gray-200 px-4 py-3 text-[16px] sticky left-0 bg-white z-10 font-medium">
                          {(currentPage - 1) * recordsPerPage + index + 1}
                        </td>
                        
                        {/* Sticky ACTIONS column */}
                        <td className="border border-gray-200 px-4 py-3 text-[16px] sticky left-[80px] bg-white z-10">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(row)}
                              className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              className="text-[#842626] hover:text-red-700 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                        
                        {/* Scrollable columns */}
                        <td className="border border-gray-200 px-4 py-3 text-[16px]">
                          {row.created ||
                            row.created_date ||
                            row.date_created ||
                            "---"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-[16px]">
                          {row.companyName ||
                            row.company_name ||
                            row.company ||
                            "---"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-[16px]">
                          {row.customerName ||
                            row.customer_name ||
                            row.customer ||
                            "---"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-[16px]">
                          {row.customerCity ||
                            row.city ||
                            row.customer_city ||
                            "---"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-[16px]">
                          {row.courierNo ||
                            row.courier_no ||
                            row.tracking_number ||
                            "---"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-[16px]">
                          {row.transportName ||
                            row.transport_name ||
                            row.courier_name ||
                            "---"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3text-[16px]  max-w-[200px] truncate">
                          {row.comment || row.remarks || row.notes || "---"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination Component */}
          {tableData.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showPageNumbers={true}
                showFirstLast={true}
                showPrevNext={true}
                showInfo={true}
                totalRecords={totalRecords}
                recordsPerPage={recordsPerPage}
                className="justify-center"
                activeButtonClassName="bg-[#842626] text-white "
              />
            </div>
          )}

          {tableData.length === 0 && !loadingTable && (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <p className="text-lg font-medium">No data found for the selected criteria</p>
              <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loadingTable && (
        <div className="min-w-full bg-white shadow-sm rounded-2xl p-8 border border-gray-100 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a76c6c] mb-4"></div>
            <div className="text-gray-600">Loading report data...</div>
            <div className="text-sm text-gray-400 mt-2">This may take a moment</div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <InwardCoverModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleUpdate}
        data={selectedRecord}
        loading={updating}
        companies={companies}
      />
    </div>
  );
};

export default InwardCover;