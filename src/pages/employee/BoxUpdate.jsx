import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/pagination/pagenation";
import ActionBoxUpdate from "../../models/employee/BoxUpdate/ActionBoxUpdate";
import { getBox, deleteBox, exportCurrent } from "../../service/employee/boxUpdate";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";

const BoxUpdate = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { auth } = useAuth();
  const navigate = useNavigate();

  // ✅ Fetch Data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        company_id: auth?.company?.id,
        page: currentPage,
        limit: recordsPerPage,
        search: search || undefined,
      };

      console.log("📦 Fetching box data with params:", params);

      const res = await getBox(params);
      console.log("✅ Backend Response:", res);

      if (res?.data?.success) {
        const responseData = res.data.data || [];
        setData(responseData);
        
        if (res.data.pagination) {
          const { totalItems, totalPages: apiTotalPages } = res.data.pagination;
          setTotalRecords(totalItems || 0);
          setTotalPages(apiTotalPages || 0);
          console.log("📊 Pagination Data:", {
            totalItems,
            totalPages: apiTotalPages,
            currentPage: res.data.pagination.currentPage
          });
        } else {
          setTotalRecords(responseData.length);
          setTotalPages(1);
        }

        if (responseData.length === 0) {
          setError("No data found for your company");
        }
      } else {
        setData([]);
        setTotalRecords(0);
        setTotalPages(0);
        setError(res?.data?.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error("❌ Error fetching box data:", err);
      setError("Failed to load data. Please try again.");
      setData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.company?.id) {
      fetchData();
    } else {
      setError("Company information not found");
      setLoading(false);
    }
  }, [auth?.company?.id, search, currentPage, recordsPerPage]);

  // ✅ Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, recordsPerPage]);

  // ✅ Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setRecordsPerPage(value);
    setCurrentPage(1);
  };

  // ✅ Actions
  const handleActionClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = (shouldRefresh = false) => {
    setIsModalOpen(false);
    setSelectedItem(null);
    if (shouldRefresh) {
      fetchData(); // Refresh data after successful update
    }
  };

  // ✅ Handle EBS Edit
  const handleEbsEdit = (item) => {
    const ebsData = {
      boxNo: item.box_no || "",
      customerName: item.customer_name || "",
      customerId: item.customer_id || "",
      createdDate: item.created_date
        ? new Date(item.created_date).toLocaleDateString()
        : "",
      action: 'edit',
      returnId: item.return_id
    };
    navigate("/employee/pes", { state: { item: ebsData } });
  };

  // ✅ Handle EBS Delete
  const handleEbsDelete = (item) => {
    const ebsData = {
      boxNo: item.box_no || "",
      customerName: item.customer_name || "",
      customerId: item.customer_id || "",
      createdDate: item.created_date
        ? new Date(item.created_date).toLocaleDateString()
        : "",
      action: 'delete',
      returnId: item.return_id
    };
    navigate("/employee/pes", { state: { item: ebsData } });
  };

  const handleSalableEdit = (item) => {
    const salableData = {
      boxNo: item.box_no || "",
      customerName: item.customer_name || "",
      customerId: item.customer_id || "",
      createdDate: item.created_date
        ? new Date(item.created_date).toLocaleDateString()
        : "",
      action: 'edit',
      returnId: item.return_id
    };
    navigate("/employee/salable", { state: { item: salableData } });
  };

  const handleSalableDelete = (item) => {
     const salableData = {
      boxNo: item.box_no || "",
      customerName: item.customer_name || "",
      customerId: item.customer_id || "",
      createdDate: item.created_date
        ? new Date(item.created_date).toLocaleDateString()
        : "",
      action: 'delete',
      returnId: item.return_id
    };
    navigate("/employee/salable", { state: { item: salableData } });
  }

  const handleExportCurrent = async () => {
    try {
      Swal.fire({
        title: "Exporting...",
        text: "Please wait while we prepare your export file.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const params = {
        company_id: auth?.company?.id,
        page: currentPage,
        limit: recordsPerPage,
        search: search || undefined,
      };

      const exportUrl = exportCurrent(params);
      console.log("📦 Exporting current page data:", exportUrl);

      window.open(exportUrl, "_blank");

      Swal.fire({
        icon: "success",
        title: "Export Started",
        text: "Your file is being downloaded.",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("❌ Export failed:", err);
      Swal.fire({
        title: "Export Failed",
        text: "Could not export the data. Please try again.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  // ✅ Handle Delete Box
  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete box ${item.box_no}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#9ca3af",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const res = await deleteBox(item.return_id);

      if (res?.data?.success) {
        await Swal.fire({
          title: "Deleted!",
          text: "The box has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });

        // Refresh data after delete
        fetchData();
      } else {
        await Swal.fire({
          title: "Failed",
          text: res?.data?.message || "Delete failed. Try again.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      await Swal.fire({
        title: "Error",
        text: "Something went wrong while deleting.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!auth?.company?.id) {
    return (
      <div className="p-6 mt-10 bg-white rounded-xl shadow-md">
        <div className="text-red-500 text-center py-8">
          Company ID not found. Please check your authentication.
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-400 mb-1">BOX UPDATE</h2>
      
      {/* Top Controls - Sticky Header */}
      <div className="sticky top-0 z-10 bg-white rounded-xl px-2 py-2 mb-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by Box No / Company / Customer / Courier No"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-400 rounded-lg p-2 focus:outline-[#6a1a13] focus:border-transparent"
            />
            
            {/* Records per Page Selector */}
            <select
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              className="border rounded-lg p-2 focus:ring-2 focus:outline-none focus:ring-[#6a1a13] focus:border-transparent"
            >
              <option value="50">50 Records</option>
              <option value="100">100 Records</option>
              <option value="200">200 Records</option>
              <option value="500">500 Records</option>
              <option value="1000">1000 Records</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCurrent}
              className="flex items-center gap-2 bg-[#6a1a13] hover:bg-[#865556] text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Download size={18} /> Export Current
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-500 py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading data...</p>
        </div>
      )}

      {/* Table with Sticky Header */}
      <div className="overflow-x-auto text-[12px] rounded">
        {!loading && ( 
          <table className="min-w-full bg-white">
            <thead className="sticky top-0 z-0 bg-gray-100 text-gray-600 uppercase text-xs text-center rounded">
              <tr>
                <th className="p-2 font-medium">SNO</th>
                <th className="p-2 font-medium">CREATED</th>
                <th className="p-2 font-medium">COMPANY NAME</th>
                <th className="p-2 font-medium">COURIER NO</th>
                <th className="p-2 font-medium">CUSTOMER NAME</th>
                <th className="p-2 font-medium">NO OF BOXES</th>
                <th className="p-2 font-medium">BOX NO</th>
                <th className="p-2 font-medium">ACTIONS</th>
                <th className="p-2 font-medium">EBS</th>
                <th className="p-2 font-medium">SALABLE</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.return_id || index} className="hover:bg-gray-50 border-b text-center border-gray-100 last:border-b-0">
                    <td className="p-3 text-[16px]">
                      {(currentPage - 1) * recordsPerPage + index + 1}
                    </td>
                    <td className="p-3 text-[16px]">
                      {item.created_date
                        ? new Date(item.created_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 text-[16px]">{item.company_name || "-"}</td>
                    <td className="p-3 text-[16px]">{item.courier_no || "-"}</td>
                    <td className="p-3 text-[16px]">{item.customer_name || "-"}</td>
                    <td className="p-3 text-[16px]">{item.no_of_boxes || "-"}</td>
                    <td className="p-3 text-[16px]">{item.box_no || "-"}</td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex justify-start gap-2">
                        <button
                          onClick={() => handleActionClick(item)}
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-[#842626] hover:text-amber-950 transition-colors duration-200 p-1 rounded"
                          title="Delete"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                    {/* Ebs */}
                    <td className="p-3">
                      <div className="flex justify-start gap-2">
                        <button
                          onClick={() => handleEbsEdit(item)}  
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded"
                          title="Edit EBS"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleEbsDelete(item)}
                          className="text-[#842626] hover:text-amber-950 transition-colors duration-200 p-1 rounded"
                          title="Delete EBS"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                    {/* Salable */}
                    <td className="p-3">
                      <div className="flex justify-start gap-2 ">
                        <button
                          onClick={() => handleSalableEdit(item)}
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded"
                          title="Edit Salable"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleSalableDelete(item)}
                          className="text-[#842626] hover:text-amber-950 transition-colors duration-200 p-1 rounded"
                          title="Delete Salable"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center p-8 text-gray-400">
                    {search ? "No matching records found" : "No data available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 0 && data.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showInfo={true}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
          />
        </div>
      )}
      
      {/* Show message if no data but pagination exists */}
      {!loading && data.length === 0 && totalPages > 0 && (
        <div className="text-center p-4 text-gray-500">
          No data found for the current page.
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ActionBoxUpdate 
          item={selectedItem} 
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default BoxUpdate;