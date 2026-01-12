import React, { useState, useEffect } from "react";
import { getCompanies } from "../../service/admin/customerApi";
import { getCompanyByCustomer } from "../../service/employee/returns";
import { getLRData, currentExport, exportAll, editLr, deleteLr } from "../../service/admin/lr";
import Pagination from "../../components/pagination/pagenation";
import { Pencil, Trash2, Eye } from "lucide-react";  
import Swal from "sweetalert2";
import LRModal from "../../models/admin/lrUpdate/lrModel";
import ClubbedModal from "../../models/employee/LR/CluppedModal";
import CaseSplitUpModal from "../../models/admin/case/casesplit";

const LRupdate = () => {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    lrNo: "",
    companyName: "",
    customerName: "",
    courierNo: "",
    invoiceNo: "",
    chequeNo: "",
    recordsPerPage: "50",
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClubbedModalOpen, setIsClubbedModalOpen] = useState(false);
  const [isCaseSplitUpModalOpen, setIsCaseSplitUpModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedClubbedRecord, setSelectedClubbedRecord] = useState(null);
  const [selectedCaseSplitUpRecord, setSelectedCaseSplitUpRecord] = useState(null);
  const [selectedCaseSplitUpCompanyId, setSelectedCaseSplitUpCompanyId] = useState("");

  // Existing states
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [exporting, setExporting] = useState(false);

  const recordsPerPage = parseInt(form.recordsPerPage) || 50;

  // Fetch customers and companies initially
  useEffect(() => {
    fetchCustomers();
    fetchCompanies();
  }, []);

  // Fetch all data when component mounts
  useEffect(() => {
    fetchLRData();
  }, [currentPage, form.recordsPerPage]);

  // Customer functions
  const fetchCustomers = async (companyId = "") => {
    try {
      setLoadingCustomers(true);
      let customerList = [];
      
      if (companyId) {
        const res = await getCompanyByCustomer(companyId);
        customerList = res?.customers || res?.data || res || [];
      } else {
        customerList = [];
      }

      setCustomers(customerList);
      setFilteredCustomers(customerList);
    } catch (err) {
      console.error("❌ Error loading customers by company:", err);
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

      const data = response?.data?.company || [];
      const companiesArray = Array.isArray(data)
        ? data.map((company, index) => {
            if (typeof company === 'object' && company.company_name) {
              return {
                id: company.company_id || index,
                name: company.company_name,
                company_name: company.company_name,
                company_id: company.company_id
              };
            }
            return {
              id: index,
              name: company,
              company_name: company,
              company_id: `COMP_${index}`
            };
          })
        : [];

      setCompanies(companiesArray);
      setFilteredCompanies(companiesArray);
    } catch (error) {
      console.error("❌ Error fetching companies:", error);
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Fetch LR Data
  const fetchLRData = async () => {
    try {
      setLoading(true);
      setNoData(false);

      const params = {
        page: currentPage,
        limit: parseInt(form.recordsPerPage),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        companyId: selectedCompanyId || undefined,
        search: form.lrNo || form.courierNo || form.invoiceNo || form.chequeNo || form.customerName || undefined,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await getLRData(params);
      console.log('api response', response);

      const apiData = response?.data;
      
      if (!apiData) {
        setNoData(true);
        setTableData([]);
        setTotalRecords(0);
        setTotalPages(0);
        return;
      }

      const data = apiData?.data || apiData?.records || apiData || [];
      const total = apiData?.totalRecords || apiData?.total || apiData?.count || data.length || 0;

      if (!data || data.length === 0) {
        setNoData(true);
        setTableData([]);
        setTotalRecords(0);
        setTotalPages(0);
      } else {
        setTableData(data);
        setTotalRecords(total);

        const recordsPerPageNum = parseInt(form.recordsPerPage);
        const calculatedTotalPages = Math.ceil(total / recordsPerPageNum);
        setTotalPages(calculatedTotalPages);
      }
    } catch (error) {
      console.error("❌ Error fetching LR data:", error);
      setNoData(true);
      setTableData([]);
      setTotalRecords(0);
      setTotalPages(0);
      
      Swal.fire({
        title: "API Error",
        text: "Failed to fetch data from server.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display in DD/MM/YYYY format
  const formatDateForDisplay = (dateString) => {
    if (!dateString || dateString === "-" || dateString === "") return "-";

    try {
      // If already in DD/MM/YYYY format, return as is
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
      }
      
      // If in YYYY-MM-DD format, convert to DD/MM/YYYY
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
      
      // If in ISO format or other date string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      // Return original if can't parse
      return dateString;
    } catch (error) {
      console.error("Date formatting error:", error, dateString);
      return dateString;
    }
  };

  // Format date only (for Created field which might have time)
  const formatDateOnly = (dateString) => {
    if (!dateString || dateString === "-" || dateString === "") return "-";
    
    try {
      // If it's a full datetime string, extract only date part
      if (dateString.includes('T') || dateString.includes(' ')) {
        const datePart = dateString.split('T')[0] || dateString.split(' ')[0];
        return formatDateForDisplay(datePart);
      }
      
      return formatDateForDisplay(dateString);
    } catch (error) {
      return formatDateForDisplay(dateString);
    }
  };

  // Export Current Page
  const handleExportCurrent = async () => {
    try {
      setExporting(true);

      const params = {
        page: currentPage,
        limit: parseInt(form.recordsPerPage),
        start_date: form.startDate || undefined,
        end_date: form.endDate || undefined,
        company_id: selectedCompanyId || undefined,
        lr_no: form.lrNo || undefined,
        courier_no: form.courierNo || undefined,
        invoice_no: form.invoiceNo || undefined,
        cheque_no: form.chequeNo || undefined,
        customer_name: form.customerName || undefined,
        company_name: form.companyName || undefined,
      };

      const confirmResult = await Swal.fire({
        title: "Export Current Page?",
        text: "Do you want to export only the current page data?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, export it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (confirmResult.isConfirmed) {
        const exportUrl = currentExport(params);
        const link = document.createElement("a");
        link.href = exportUrl;
        link.setAttribute("download", "lr_data_current.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
          title: "Export Started!",
          text: "Your current page data export is in progress.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.log("Error exporting current page", error);
      Swal.fire({
        title: "Export Failed",
        text: "Something went wrong while exporting current page data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setExporting(false);
    }
  };

  // Export All Pages
  const handleExportAll = async () => {
    try {
      setExporting(true);

      const params = {
        start_date: form.startDate || undefined,
        end_date: form.endDate || undefined,
        company_id: selectedCompanyId || undefined,
        lr_no: form.lrNo || undefined,
        courier_no: form.courierNo || undefined,
        invoice_no: form.invoiceNo || undefined,
        cheque_no: form.chequeNo || undefined,
        customer_name: form.customerName || undefined,
        company_name: form.companyName || undefined,
      };

      const confirmResult = await Swal.fire({
        title: "Export All Pages?",
        text: "This may take longer. Do you want to export all pages?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, export all!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (confirmResult.isConfirmed) {
        const exportUrl = exportAll(params);
        const link = document.createElement("a");
        link.href = exportUrl;
        link.setAttribute("download", "lr_data_full.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
          title: "Export Started!",
          text: "Your full data export is in progress.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.log("Error exporting all pages", error);
      Swal.fire({
        title: "Export Failed",
        text: "Something went wrong while exporting all pages.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setExporting(false);
    }
  };

  // Handle customer search input change
  const handleCustomerSearchChange = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
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

  // Handle company search input change
  const handleCompanySearchChange = (e) => {
    const value = e.target.value;
    setCompanySearch(value);
    setForm((prev) => ({ ...prev, companyName: value }));
    setShowCompanyDropdown(true);

    if (value.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((company) => {
        const searchLower = value.toLowerCase();
        const name = company.name?.toLowerCase() || "";
        const companyName = company.company_name?.toLowerCase() || "";

        return name.includes(searchLower) || companyName.includes(searchLower);
      });
      setFilteredCompanies(filtered);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    const customerName = customer.name || customer.customer_name || "";
    setCustomerSearch(customerName);
    setForm((prev) => ({
      ...prev,
      customerName: customerName,
    }));
    setShowCustomerDropdown(false);
  };

  // Handle company selection
  const handleCompanySelect = (company) => {
    const companyName = company.name || company.company_name || "";
    const companyId = company.company_id || "";
    
    setCompanySearch(companyName);
    setSelectedCompanyId(companyId);
    setForm((prev) => ({
      ...prev,
      companyName: companyName,
      customerName: ""
    }));
    setShowCompanyDropdown(false);

    if (companyId) {
      fetchCustomers(companyId);
    } else {
      setCustomers([]);
      setFilteredCustomers([]);
    }
  };

  // Handle other input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    await fetchLRData();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle Edit Click
  const handleEditClick = (record) => {
    console.log("🔄 Editing record:", record);
    
    const modalData = {
      salesId: record.sales_id || record.id,
      companyName: record["Company name"] || record.company_name || "",
      customerName: record["Customer name"] || record.customer_name || "",
      customerCity: record["Customer city"] || record.customer_city || "",
      transportName: record["Transport Name"] || record.transport_name || "",
      courierNo: record["Courier no"] || record.courier_no || "",
      invoiceNo: record["Invoice no"] || record.invoice_no || "",
      invoiceDate: record["Invoice date"] || record.invoice_date || "",
      invoiceValue: record["Invoice value"] || record.invoice_value || "",
      lrNo: record["Lr no"] || record.lr_no || record["LR NO"] || record.lr_number || record.lrNo || "",
      lrDate: record["Lr date"] || record.lr_date || "",
      noOfBoxes: record["Num Of Bo"] || record.no_of_boxes || "",
      weight: record.Weight || record.weight || "",
      chequeNo: record["Cheque no"] || record.cheque_no || "",
      chequeDate: record["Cheque date"] || record.cheque_date || "",
      appChequeNo: record.appChequeNo || "",
      appChequeDate: record.appChequeDate || "",
      appDeliverySection: record.appDeliverySection || "",
      warehousePerson: record.warehousePerson || "",
      driver: record.driver || "",
      vehicleNumber: record.vehicleNumber || "",
      deliveryPerson: record.deliveryPerson || "",
      collectionAgent: record.collectionAgent || "",
      packedTime: record.packedTime || "",
      outTime: record.outTime || "",
      deliveredTime: record.deliveredTime || "",
      chequeReceivedTime: record.chequeReceivedTime || "",
      comments: record.Comments || record.comments || ""
    };

    console.log("📝 Prepared modal data:", modalData);
    setSelectedRecord(modalData);
    setIsModalOpen(true);
  };

  // Handle Clubbed Details Click
  const handleClube = (record) => {
    console.log("🔍 Viewing clubbed details:", record);
    
    // Prepare data for the clubbed modal
    const modalData = {
      // Original record data
      ...record,
      
      // Specific fields needed for the modal
      companyName: record["Company name"] || record.company_name || "",
      reference: record.Reference || record.reference || "",
      
      // Directly pass clubbed_from as it is (it's already a string or array)
      clubbed_from: record.clubbed_from,
      
      // Get clubbed boxes count
      clubedBoxes: record["Clubed Boxes"] || record.clubedBoxes || record.Clubed_boxes || "",
      
      // Regular boxes
      regularBoxes: record["No of box"] || record.no_of_boxes || record.Regular_boxes || 0
    };
    
    console.log("📦 Prepared clubbed data:", modalData);
    setSelectedClubbedRecord(modalData);
    setIsClubbedModalOpen(true);
  };

  // Function to check if company is eligible for Case Split Up
  const isCaseSplitUpEligible = (companyId) => {
    // Only show for these specific company IDs
    const eligibleCompanyIds = ["GRE_e978a792", "VGU_a2cb4a9d"];
    return eligibleCompanyIds.includes(companyId);
  };

  // Handle Case Split Up Click
  const handleCaseSplitUp = (record) => {
    console.log("📋 Viewing case split up details:", record);
    
    // Get company ID from record
    const companyId = record.companyId || record.company_id || "";
    
    // Check if company is eligible
    if (!isCaseSplitUpEligible(companyId)) {
      console.log("❌ Company not eligible for Case Split Up:", companyId);
      return;
    }
    
    // Prepare data for the case split up modal
    const modalData = {
      // Original record data
      ...record,
      
      // Specific fields needed for the modal
      companyName: record["Company name"] || record.company_name || "",
      invoiceNo: record["Invoice no"] || record.invoice_no || "",
      reference: record.Reference || record.reference || "",
      sales_id: record.sales_id || "",
      
      // Include raw data for parsing
      _raw: record
    };
    
    console.log("📊 Prepared case split up data:", modalData);
    console.log("🏢 Company ID for modal:", companyId);
    
    setSelectedCaseSplitUpRecord(modalData);
    setSelectedCaseSplitUpCompanyId(companyId);
    setIsCaseSplitUpModalOpen(true);
  };

  // Handle Modal Close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  // Handle Clubbed Modal Close
  const handleClubbedModalClose = () => {
    setIsClubbedModalOpen(false);
    setSelectedClubbedRecord(null);
  };

  // Handle Case Split Up Modal Close
  const handleCaseSplitUpModalClose = () => {
    setIsCaseSplitUpModalOpen(false);
    setSelectedCaseSplitUpRecord(null);
    setSelectedCaseSplitUpCompanyId("");
  };

  // Handle Modal Save
  const handleModalSave = async (updatedData) => {
    try {
      console.log("💾 Original modal data:", updatedData);
      
      const { salesId, lrNumbers, ...dataToUpdate } = updatedData;
      
      if (!salesId) {
        throw new Error("Sales ID is required for update");
      }
      
      // ✅ SIMPLE COMMA SEPARATED LR NUMBERS
      let lrNoValue = "";
      if (lrNumbers && Array.isArray(lrNumbers)) {
        const cleanLrNumbers = lrNumbers
          .filter(lr => lr && lr.toString().trim() !== '')
          .map(lr => lr.toString().trim());
        
        if (cleanLrNumbers.length > 0) {
          lrNoValue = cleanLrNumbers.join(",");
        }
      }
      
      // ✅ PREPARE BACKEND DATA
      const backendData = {
        no_of_boxes: dataToUpdate.noOfBoxes || "",
        weight: dataToUpdate.weight || "",
        cheque_date: dataToUpdate.chequeDate || "",
        cheque_no: dataToUpdate.chequeNo || "",
        lr_no: lrNoValue, // "50119771,111,1236" - SIMPLE STRING
        lr_date: dataToUpdate.lrDate || "",
        courier_no: dataToUpdate.courierNo || "",
        transport_name: dataToUpdate.transportName || ""
      };

      console.log("📤 Final backend data:", backendData);
      
      // ✅ SEND TO API
      await editLr(salesId, backendData);
      
      Swal.fire({
        title: "Success!",
        text: "Record updated successfully",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      // Refresh data
      fetchLRData();
    } catch (error) {
      console.error("❌ Error saving record:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update record",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsModalOpen(false);
      setSelectedRecord(null);
    }
  };

  // Handle Delete
  const handleDelete = async (record) => {
    const salesId = record.sales_id || record.id;
    
    if (!salesId) {
      Swal.fire({
        title: "Error!",
        text: "Cannot delete record: Sales ID not found",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete LR record: ${record["Lr no"] || record.lr_no || salesId}. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        
        console.log('🗑️ Attempting to delete record with sales_id:', salesId);
        
        // Call delete API
        await deleteLr(salesId);
        
        Swal.fire({
          title: "Deleted!",
          text: "LR record has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        
        // Refresh data after deletion
        fetchLRData();
        
      } catch (error) {
        console.error("Error deleting record:", error);
        
        let errorMessage = "Failed to delete record.";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Swal.fire({
          title: "Delete Failed!",
          text: errorMessage,
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
      }
    }
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

  return (
    <div className="p-2 mt-2">
      {/* Filters Section */}
      <div className="flex justify-center mb-4">
        <div className="w-full max-w-8xl rounded-2xl p-2">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            LR UPDATE
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-9 gap-2"
          >
            {/* Start Date */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                START DATE
              </label>
              <div className="flex items-center border rounded-md bg-gray-50">
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-2 outline-none"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                END DATE
              </label>
              <div className="flex items-center border rounded-md bg-gray-50">
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-2 outline-none"
                />
              </div>
            </div>

            {/* LR No */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                LR NO
              </label>
              <input
                type="text"
                name="lrNo"
                value={form.lrNo}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-50 outline-none"
                placeholder="LR NO"
              />
            </div>

            {/* Company Name (with dropdown) */}
            <div className="company-dropdown relative">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                COMPANY NAME
              </label>
              <input
                type="text"
                name="companyName"
                value={companySearch}
                onChange={handleCompanySearchChange}
                onFocus={() => setShowCompanyDropdown(true)}
                className="w-full border rounded-md px-3 py-2 bg-gray-50 outline-none"
                placeholder="COMPANY NAME"
              />

              {showCompanyDropdown && (
                <ul className="absolute z-10 w-full bg-white border max-h-48 overflow-y-auto rounded-md shadow-md mt-1">
                  {loadingCompanies ? (
                    <li className="p-2 text-gray-500 text-sm">Loading...</li>
                  ) : filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <li
                        key={company.id}
                        onClick={() => handleCompanySelect(company)}
                        className="p-2 text-sm hover:bg-rose-100 cursor-pointer"
                      >
                        {company.name || company.company_name || "Unknown Company"}
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-gray-500 text-sm">
                      No companies found
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Customer Name (with dropdown) */}
            <div className="customer-dropdown relative">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                CUSTOMER NAME
              </label>
              <input
                type="text"
                name="customerName"
                value={customerSearch}
                onChange={handleCustomerSearchChange}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full border rounded-md px-3 py-2 bg-gray-50 outline-none"
                placeholder="CUSTOMER"
                disabled={!selectedCompanyId && companies.length > 0}
              />

              {showCustomerDropdown && (
                <ul className="absolute z-10 w-full bg-white border max-h-48 overflow-y-auto rounded-md shadow-md mt-1">
                  {loadingCustomers ? (
                    <li className="p-2 text-gray-500 text-sm">Loading...</li>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <li
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="p-2 text-sm hover:bg-rose-100 cursor-pointer"
                      >
                        {customer.name || customer.customer_name || "Unknown Customer"}
                      </li>
                    ))
                  ) : !selectedCompanyId && companies.length > 0 ? (
                    <li className="p-2 text-gray-500 text-sm">
                      Please select a company first
                    </li>
                  ) : (
                    <li className="p-2 text-gray-500 text-sm">
                      No customers found
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Courier No */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                COURIER NO
              </label>
              <input
                type="text"
                name="courierNo"
                value={form.courierNo}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-50 outline-none"
                placeholder="COURIER NO"
              />
            </div>

            {/* Invoice No */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                INVOICE NO
              </label>
              <input
                type="text"
                name="invoiceNo"
                value={form.invoiceNo}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-50 outline-none"
                placeholder="INVICE NO"
              />
            </div>

            {/* Cheque No */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                CHEQUE NO
              </label>
              <input
                type="text"
                name="chequeNo"
                value={form.chequeNo}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-50 outline-none"
                placeholder="CHEQUE NO"
              />
            </div>

            {/* Records per Page */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                RECORDS PER PAGE
              </label>
              <select
                name="recordsPerPage"
                value={form.recordsPerPage}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-50 outline-none"
              >
                <option value="25">25</option>
                <option value="50">50 (default)</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="col-span-1 md:col-span-4 flex justify-start mt-2">
              <button
                type="submit"
                className="bg-[#6a1a12] hover:bg-[#955d5d] text-white px-6 py-2 rounded-md shadow-sm transition"
                disabled={loading}
              >
                {loading ? "Loading..." : "Get Report"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Export Buttons */}
      {tableData.length > 0 && (
        <div className="flex justify-end gap-4 mb-2">
          <button
            onClick={handleExportCurrent}
            disabled={exporting}
            className="bg-[#6a1a12] hover:bg-[#955d5d] text-white px-4 py-2 rounded-md shadow-sm transition disabled:bg-gray-400 flex items-center gap-2"
          >
            {exporting ? "Exporting..." : "Export Current"}
          </button>
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="bg-[#6a1a12] hover:bg-[#955d5d] text-white px-4 py-2 rounded-md shadow-sm transition disabled:bg-gray-400 flex items-center gap-2"
          >
            {exporting ? "Exporting..." : "Export All"}
          </button>
        </div>
      )}

      {/* Table Section */}
      {tableData.length > 0 && (
        <div className="relative rounded-xl shadow-sm border border-gray-200 mt-4">
          <div className="overflow-y-auto max-h-[700px] scrollbar-hide">
            <table className="min-w-full text-sm text-gray-700 border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left">SNO</th>
                  <th className="px-4 py-2 text-left">ACTIONS</th>
                  <th className="px-4 py-2 text-left">CREATED</th>
                  <th className="px-4 py-2 text-left">INVOICE NO</th>
                  <th className="px-4 py-2 text-left">INVOICE DATE</th>
                  <th className="px-4 py-2 text-left">TRANSPORT NAME</th>
                  <th className="px-4 py-2 text-left">COMPANY NAME</th>
                  <th className="px-4 py-2 text-left">CUSTOMER NAME</th>
                  <th className="px-4 py-2 text-left">CUSTOMER CITY</th>
                  <th className="px-4 py-2 text-left">INVOICE VALUE</th>
                  <th className="px-4 py-2 text-left">COURIER NO</th>
                  <th className="px-4 py-2 text-left">REGULAR BOXES</th>
                  <th className="px-4 py-2 text-left">CLUBED BOX</th>
                  <th className="px-4 py-2 text-left">CASE SPLIT-UP</th>
                  <th className="px-4 py-2 text-left">REFERENCE</th>
                  <th className="px-4 py-2 text-left">WEIGHT</th>
                  <th className="px-4 py-2 text-center">LR NO</th>
                  <th className="px-4 py-2 text-left">LR DATE</th>
                  <th className="px-4 py-2 text-left">EWAY BILL</th>
                  <th className="px-4 py-2 text-left">CHEQUE NO</th>
                  <th className="px-4 py-2 text-left">CHEQUE DATE</th>
                  <th className="px-4 py-2 text-left">COMMENTS</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item, index) => {
                  // Get company ID for this row
                  const companyId = item.companyId || item.company_id || "";
                  // Check if this company is eligible for Case Split Up
                  const showCaseSplitUp = isCaseSplitUpEligible(companyId);
                  
                  return (
                    <tr
                      key={item.sales_id || item.id || index}
                      className="hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="border border-gray-200 px-4 py-3 text-[16px] left-0 bg-white z-10 font-medium">
                        {(currentPage - 1) * recordsPerPage + index + 1}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-[16px] left-0 bg-white z-10">
                        <div className="flex gap-2 justify-center">
                          <button
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded"
                            title="Edit"
                            onClick={() => handleEditClick(item)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-[#842626] hover:text-red-700 transition-colors duration-200 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {formatDateOnly(item.Created)}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Invoice no"] || item.invoice_no || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {formatDateForDisplay(
                          item["Invoice date"] || item.invoice_date
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Transport Name"] || item.transport_name || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Company name"] || item.company_name || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Customer name"] || item.customer_name || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Customer city"] || item.customer_city || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Invoice value"] || item.invoice_value || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Courier no"] || item.courier_no || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["No of box"] || item.no_of_boxes || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 text-right">
                            {item["Clubed Boxes"] || item.clubedBoxes || item.Clubed_boxes || "-"}
                          </div>
                          <button
                            onClick={() => handleClube(item)}
                            className="bg-[#842626] text-white rounded-lg px-3 py-1 flex items-center gap-1 hover:bg-[#865556] transition-colors flex-shrink-0"
                          >
                            <Eye size={14} /> 
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        <div className="flex items-center  ">
                          <div className="flex-1 text-right">
                            {item["Case Split-up"] || item.case_split_up || ""}
                          </div>
                          {/* Only show eye icon if company is eligible */}
                          {showCaseSplitUp ? (
                            <button
                              onClick={() => handleCaseSplitUp(item)}
                              className="bg-[#842626] text-white rounded-lg px-3 py-1 flex items-center gap-1 hover:bg-[#865556] transition-colors flex-shrink-0"
                            >
                              <Eye size={14} /> 
                            </button>
                          ) : (
                            <div className="w-12 flex-shrink-0"></div> 
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item.Reference || item.reference || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.Weight || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px] text-center">
                        {item["Lr no"] || item.lr_no || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {formatDateForDisplay(item["Lr date"] || item.lr_date)}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Eway Bill"] || item.eway_bill || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item["Cheque no"] || item.cheque_no || "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {formatDateForDisplay(
                          item["Cheque date"] || item.cheque_date
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item.Comments || item.comments || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-6">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mr-3"></div>
            Loading data...
          </div>
        </div>
      )}

      {/* No Data State */}
      {noData && !loading && (
        <div className="text-center py-6 text-gray-500">
          No data found with the current filters.
        </div>
      )}

      {/* Pagination */}
      {!loading && !noData && totalPages > 1 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-15">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalRecords={totalRecords}
            recordsPerPage={parseInt(form.recordsPerPage)}
            showInfo={true}
          />
        </div>
      )}

      {/* LR Update Modal */}
      <LRModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        data={selectedRecord}
        onSave={handleModalSave}
      />

      {/* Clubbed Details Modal */}
      <ClubbedModal
        isOpen={isClubbedModalOpen}
        onClose={handleClubbedModalClose}
        data={selectedClubbedRecord}
      />

      {/* Case Split Up Modal */}
      <CaseSplitUpModal
        isOpen={isCaseSplitUpModalOpen}
        onClose={handleCaseSplitUpModalClose}
        data={selectedCaseSplitUpRecord}
        companyId={selectedCaseSplitUpCompanyId}
      />

      {/* Records Info */}
      {!loading && !noData && tableData.length > 0 && (
        <div className="text-center mt-4 text-gray-600 text-sm">
          Showing {tableData.length} of {totalRecords} records
          {totalPages > 1 && ` | Page ${currentPage} of ${totalPages}`}
        </div>
      )}
    </div>
  );
};

export default LRupdate;