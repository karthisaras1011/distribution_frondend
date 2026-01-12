import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getReturnsByApp, updateReturnApproval } from "../../service/employee/returnsByApp";
import Swal from "sweetalert2";
import Pagination from "../../components/pagination/pagenation";
import ApproveReturnModal from "../../models/employee/ReturnsByApp/ApproveReturnModal"; // Import the modal

export default function ReturnsByApp() {
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
  
  // Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Fetch returns data function
  const fetchData = async (page = 1) => {
    try {
      if (!auth.company?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      const params = {
        companyId: auth.company.id,
        page,
        limit: recordsPerPage,
        startDate,
        endDate,
        search: searchTerm,
      };

      const res = await getReturnsByApp(params);
      console.log("GET Returns Data: ", res);
      
      const rows = res?.data || [];

      const formatted = rows.map((item, index) => {
        return {
          id: item.return_id,
          sno: index + 1 + (page - 1) * recordsPerPage,
          created: item.created_date || "",
          vehicleDriver: item.courier_no || "N/A",
          transport: item.transport_name || "",
          company: item.company_name || "",
          customer: item.customer_name || "",
          city: item.customer_city || "",
          boxes: item.no_of_boxes || 0,
          status: item.app_status === 1 ? "Active" : "Inactive",
          boxNo: item.box_no || "",
          returnId: item.return_id,
          customerId: item.customer_id,
          companyId: item.company_id,
          boxChecked: item.box_checked,
          _raw: item,
        };
      });

      setTableData(formatted);
      setCurrentPage(res?.currentPage || page);
      setTotalPages(res?.totalPages || 1);
      setTotalRecords(res?.totalRecords || 0);
    } catch (err) {
      console.error("Error fetching returns data:", err);
      setError("Failed to fetch returns data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData(1);
  }, [searchTerm, startDate, endDate, recordsPerPage, auth.company?.id]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page);
  };

  // Open approve modal
  const handleApprove = (item) => {
    setSelectedReturn(item);
    setShowApproveModal(true);
  };

  // Close approve modal
  const handleCloseModal = () => {
    setShowApproveModal(false);
    setSelectedReturn(null);
  };

  // Handle approval submission
const handleApproveSubmit = async (returnData, approvalData) => {
  try {
    // Prepare data for API
    const updateData = {
      boxChecked: approvalData.boxChecked,
      notChecked: approvalData.notChecked,
      salable: approvalData.salable,
      expired: approvalData.expired,
      boxNumber: approvalData.boxNumber,
      companyId: returnData.companyId
    };

    console.log("Submitting approval:", {
      returnId: returnData.returnId,
      updateData
    });

    // Call the update API
    const result = await updateReturnApproval(returnData.returnId, updateData);
    
    console.log("Approval submitted successfully:", result);

    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Approval Submitted',
      text: `Return ${returnData.returnId} has been approved successfully!`,
      confirmButtonColor: '#842626',
      timer: 2000
    });

    // Refresh data
    fetchData(currentPage);

  } catch (error) {
    console.error("Error submitting approval:", error);
    
    // Show specific error message from API if available
    const errorMessage = error.response?.data?.message || 'Failed to submit approval. Please try again.';
    
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: errorMessage,
      confirmButtonColor: '#842626'
    });
    
    throw error;
  }
};

  // Handle other actions (view, edit, delete)
  const handleAction = (actionType, item) => {
    switch (actionType) {
      case 'view':
        Swal.fire({
          title: 'Return Details',
          html: `
            <div class="text-left space-y-2">
              <p><strong>Return ID:</strong> ${item.returnId}</p>
              <p><strong>Created:</strong> ${item.created}</p>
              <p><strong>Courier No:</strong> ${item.vehicleDriver}</p>
              <p><strong>Transport:</strong> ${item.transport}</p>
              <p><strong>Company:</strong> ${item.company}</p>
              <p><strong>Customer:</strong> ${item.customer}</p>
              <p><strong>City:</strong> ${item.city}</p>
              <p><strong>Boxes:</strong> ${item.boxes}</p>
              <p><strong>Box No:</strong> ${item.boxNo}</p>
              <p><strong>Status:</strong> ${item.status}</p>
            </div>
          `,
          icon: 'info',
          width: '500px'
        });
        break;
      case 'edit':
        Swal.fire({
          title: 'Edit Return',
          text: `Edit return ${item.returnId}`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Update',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#842626'
        });
        break;
      case 'delete':
        Swal.fire({
          title: 'Delete Return',
          text: `Are you sure you want to delete return ${item.returnId}?`,
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#842626'
        });
        break;
      default:
        break;
    }
  };

  // Render table rows
  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-8 text-[16px]">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#842626]"></div>
              <span className="ml-2 text-gray-600">Loading returns data...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-4 text-red-600">
            {error}
          </td>
        </tr>
      );
    }

    if (tableData.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-8 text-gray-500">
            No returns data found for the selected criteria
          </td>
        </tr>
      );
    }

    return tableData.map((item) => (
      <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-[16px] text-center font-medium">{item.sno}</td>
        <td className="px-4 py-3 text-[16px]">{item.created}</td>
        <td className="px-4 py-3 text-[16px] font-semibold">{item.vehicleDriver}</td>
        <td className="px-4 py-3 text-[16px]">{item.transport}</td>
        <td className="px-4 py-3 text-[16px]">{item.company}</td>
        <td className="px-4 py-3 text-[16px] font-semibold">{item.customer}<span className="text-gray-400 font-semibold"><br/>{item.customerId}</span></td>
        <td className="px-4 py-3 text-[16px]">{item.city}</td>
        <td className="px-4 py-3 text-[16px] text-center font-semibold">{item.boxes}</td>
        <td className="px-4 py-3 text-[16px]">
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => handleApprove(item)}
              className="bg-[#6a1a13] text-white  px-3 py-1 rounded text-[16px] transition-colors shadow-sm border border-white"
              title="Approve Return"
            >
              Approve
            </button>
            {/* <button
              onClick={() => handleAction('view', item)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors shadow-sm"
              title="View Details"
            >
              View
            </button> */}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="p-2 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-semibold text-gray-400 mb-4">
        RETURNS BY APP
      </h2>

      {/* Filters and Table content remains the same */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-2 mx-10">
  {/* Search */}
  <div>
    <fieldset className="border border-gray-300 rounded-md px-3 py-1 h-12 w-full">
      <legend className="text-xs text-gray-800 px-1">SEARCH</legend>
      <input
        type="text"
        name="searchTerm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-transparent outline-none text-gray-800"
        placeholder="Search by customer, transport..."
        aria-label="Search"
      />
    </fieldset>
  </div>

  {/* Start Date */}
  <div>
    <fieldset className="border border-gray-300 rounded-md px-3 py-1 h-12 w-full">
      <legend className="text-xs text-gray-800 px-1">START DATE</legend>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full bg-transparent outline-none text-gray-500"
      />
    </fieldset>
  </div>

  {/* End Date */}
  <div>
    <fieldset className="border border-gray-300 rounded-md px-3 py-1 h-12 w-full">
      <legend className="text-xs text-gray-800 px-1">END DATE</legend>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full bg-transparent outline-none text-gray-500"
      />
    </fieldset>
  </div>

  {/* Records per page */}
  <div>
    <fieldset className="border border-gray-300 rounded-md px-3 py-1 h-12 w-full">
      <legend className="text-xs text-gray-800 px-1">RECORDS PER PAGE</legend>
      <select
        value={recordsPerPage}
        onChange={(e) => setRecordsPerPage(Number(e.target.value))}
        className="w-full bg-transparent outline-none text-gray-500"
      >
        <option value={50}>50 (Default)</option>
        <option value={100}>100</option>
        <option value={200}>200</option>
        <option value={500}>500</option>
      </select>
    </fieldset>
  </div>
</div>
      {/* Table */}
      <div className="bg-gray-50 rounded-xl text-center shadow-inner mt-6 overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-semibold">S.No</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Created</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Vehicle/Driver</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Transport</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Company</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">City</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Boxes</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            onPageChange={handlePageChange}
            showInfo={true}
            className="mt-4"
          />
        </div>
      </div>

      {/* Separate Modal Component */}
      <ApproveReturnModal
        isOpen={showApproveModal}
        onClose={handleCloseModal}
        returnData={selectedReturn}
        onApproveSubmit={handleApproveSubmit}
      />
    </div>
  );
}