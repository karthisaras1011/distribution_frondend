import React, { useState, useEffect } from "react";
import {
  getExportAll,
  getExportCurrent,
  getReturns,
  deleteReturn,
  updateReturn
} from "../../service/admin/return";
import { Pencil, Trash2 } from "lucide-react";
import Returnmodel from "../../models/admin/return/Returnmodel";
import Swal from "sweetalert2";
import Pagination from "../../components/pagination/pagenation";

const Return = () => {
  const [formData, setFormData] = useState({
    search: "",
    recordsPerPage: "50",
    startDate: "",
    endDate: "",
    boxStatus: "",
  });

  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [returnsData, setReturnsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name !== "recordsPerPage") {
      setCurrentPage(1);
    }
  };

  const fetchReturns = async () => {
    console.log("Fetching returns...");
    try {
      setLoading(true);
      setNoData(false);

      const { recordsPerPage, startDate, endDate, boxStatus, search } = formData;

      const params = {
        limit: parseInt(recordsPerPage),
        page: currentPage,
        start_date: startDate,
        end_date: endDate,
        box_status: boxStatus,
        search: search || "",
      };

      console.log("GetReturns Admin Request: ", params);

      const response = await getReturns(params);
      console.log("API Response:", response);
      
      // Updated response handling based on backend structure
      const apiData = response?.data;
      
      if (!apiData || !apiData.success) {
        setNoData(true);
        setReturnsData([]);
        setFilteredData([]);
        setTotalRecords(0);
        setTotalPages(0);
        return;
      }

      const data = apiData?.data || [];
      const total = apiData?.totalRecords || 0;

      console.log("Returns Data: ", data);
      console.log("Total Records: ", total);

      if (data.length === 0) {
        setNoData(true);
        setReturnsData([]);
        setFilteredData([]);
        setTotalRecords(0);
        setTotalPages(0);
      } else {
        setReturnsData(data);
        setTotalRecords(total);

        const recordsPerPageNum = parseInt(recordsPerPage);
        const calculatedTotalPages = Math.ceil(total / recordsPerPageNum);
        setTotalPages(calculatedTotalPages);

        applySearchFilter(data, formData.search);
      }
    } catch (error) {
      console.error("❌ Error fetching returns:", error);
      setNoData(true);
      setReturnsData([]);
      setFilteredData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = (data, search) => {
    if (!search || search.trim() === "") {
      setFilteredData(data);
      setNoData(data.length === 0);
      return;
    }

    const searchLower = search.toLowerCase();

    const filtered = data.filter(
      (item) =>
        (item.box_no &&
          item.box_no.toString().toLowerCase().includes(searchLower)) ||
        (item.company_name &&
          item.company_name.toLowerCase().includes(searchLower)) ||
        (item.customer_name &&
          item.customer_name.toLowerCase().includes(searchLower))
    );
    setFilteredData(filtered);
    setNoData(filtered.length === 0);
  };

  const handleSubmit = (e) => { 
    e.preventDefault();
    setCurrentPage(1);
    fetchReturns();
  };

  const exportCurrentPage = async () => {
    try {
      const { recordsPerPage, startDate, endDate, boxStatus, search } = formData;

      const params = {
        limit: parseInt(recordsPerPage),
        page: currentPage,
        start_date: startDate,
        end_date: endDate,
        box_status: boxStatus,
        search: search || "",
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
        const exportUrl = getExportCurrent(params);
        const link = document.createElement("a");
        link.href = exportUrl;
        link.setAttribute("download", "");
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
    }
  };

  const exportAllPages = async () => {
    try {
      const { recordsPerPage, startDate, endDate, boxStatus, search } = formData;

      const params = {
        limit: parseInt(recordsPerPage),
        page: currentPage,
        start_date: startDate,
        end_date: endDate,
        box_status: boxStatus,
        search: search || "",
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
        const exportUrl = getExportAll(params);
        const link = document.createElement("a");
        link.href = exportUrl;
        link.setAttribute("download", "");
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
    }
  };

  const handleEdit = (item) => {
    setSelectedReturn(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    console.log(item.return_id, "delete_id");
    
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete return with Box No ${item.box_no}. This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      });

      if (result.isConfirmed) {
        // Updated to handle backend response structure
        const response = await deleteReturn({ return_id: item.return_id });
        
        if (response.data.success) {
          Swal.fire({
            title: "Deleted!",
            text: `Return with Box No ${item.box_no} has been deleted.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchReturns();
        } else {
          throw new Error(response.data.message || "Delete failed");
        }
      }
    } catch (error) {
      console.error("Error deleting return:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to delete return. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedReturn(null);
    setIsEditMode(false);
    // Refresh data when modal closes (after credit insertion or any operation)
    fetchReturns();
  };

  const handleModalSave = async (updatedData) => {
    try {
      console.log("Save data:", updatedData);
      
      // This should only be called for return updates, not credit inserts
      if (updatedData) {
        const response = await updateReturn(updatedData);
        
        if (response.data.success) {
          Swal.fire({
            title: "Success!",
            text: "Return has been updated successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          
          fetchReturns();
          handleModalClose();
        } else {
          throw new Error(response.data.message || "Update failed");
        }
      }
    } catch (error) {
      console.error("Error updating return:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to update return. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to extract and combine credit details from the credit_details array
  const getCombinedCreditDetails = (item) => {
    if (!item.credit_details || !Array.isArray(item.credit_details) || item.credit_details.length === 0) {
      return { 
        credit_nos: '', 
        credit_dates: '', 
        mra_nos: '', 
        mra_dates: '' 
      };
    }
    
    // Combine all credit records into single strings for display
    const creditNos = item.credit_details
      .map(credit => credit.credit_no)
      .filter(Boolean)
      .join(', ');
    
    const creditDates = item.credit_details
      .map(credit => credit.credit_date)
      .filter(Boolean)
      .join(', ');
    
    const mraNos = item.credit_details
      .map(credit => credit.mra_no)
      .filter(Boolean)
      .join(', ');
    
    const mraDates = item.credit_details
      .map(credit => credit.mra_date)
      .filter(Boolean)
      .join(', ');

    return {
      credit_nos: creditNos,
      credit_dates: creditDates,
      mra_nos: mraNos,
      mra_dates: mraDates
    };
  };

  // Function to get the latest credit details (for backward compatibility)
  const getLatestCreditDetails = (item) => {
    if (!item.credit_details || !Array.isArray(item.credit_details) || item.credit_details.length === 0) {
      return { 
        credit_no: '', 
        credit_date: '', 
        mra_no: '', 
        mra_date: '' 
      };
    }
    
    // Get the first record as the primary one for display
    const latestCredit = item.credit_details[0];
    
    return {
      credit_no: latestCredit.credit_no || '',
      credit_date: latestCredit.credit_date || '',
      mra_no: latestCredit.mra_no || '',
      mra_date: latestCredit.mra_date || ''
    };
  };

  useEffect(() => {
    applySearchFilter(returnsData, formData.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.search]);

  useEffect(() => {
    fetchReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, formData.recordsPerPage]);

  return (
    <div className="p-4 mt-2">
      {/* Filters */}
      <h2 className="text-xl font-bold text-gray-600 mb-2">
        Returns
        </h2>
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <input
          type="text"
          name="search"
          value={formData.search}
          onChange={handleChange}
          placeholder="Box No, Company Name, Customer Name..."
          className="w-96 px-3 py-2 border border-gray-300 rounded-lg  "
        />
        <select
          name="recordsPerPage"
          value={formData.recordsPerPage}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500"
        >
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
          <option value="200">200 per page</option>
          <option value="500">500 per page</option>
        </select>
        <select
          name="boxStatus"
          value={formData.boxStatus}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500"
        >
          <option value="">All Statuses</option>
          <option value="checked">Checked</option>
          <option value="not-checked">Not Checked</option>
        </select>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500"
        />
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500"
        />
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleSubmit}
            className="bg-[#6a1a12] hover:bg-[#955d5d] text-white px-4 py-2 text-sm rounded-md transition-all duration-200"
          >
            Get Report
          </button>
          <button
            onClick={exportCurrentPage}
            className="bg-[#6a1a12]  text-white px-4 py-2 text-sm rounded-md hover:bg-[#955d5d] transition-all duration-200"
          >
            Export Current Page
          </button>
          <button
            onClick={exportAllPages}
            className="bg-[#6a1a12] text-white px-4 py-2 text-sm rounded-md hover:bg-[#955d5d] transition-all duration-200"
          >
            Export All Pages
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative rounded-xl shadow-sm border border-gray-200 mt-4">
        <div className="overflow-auto max-h-[700px]  ">
          <table className="min-w-max text-sm text-gray-700 border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left">SNO</th>
                <th className="px-4 py-2 text-left">Actions</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Courier No</th>
                <th className="px-4 py-2 text-left">Transport Name</th>
                <th className="px-4 py-2 text-left">Company Name</th>
                <th className="px-4 py-2 text-left">Customer Name</th>
                <th className="px-4 py-2 text-left">Customer City</th>
                <th className="px-4 py-2 text-left">No of Boxes</th>
                <th className="px-4 py-2 text-left">Box Checked</th>
                <th className="px-4 py-2 text-left">Box No</th>
                <th className="px-4 py-2 text-left">Salable Credit No</th>
                <th className="px-4 py-2 text-left">Salable Credit Date</th>
                <th className="px-4 py-2 text-left">EBS Credit No</th>
                <th className="px-4 py-2 text-left">EBS Credit Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="15" className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : noData ? (
                <tr>
                  <td colSpan="15" className="text-center py-6 text-gray-500">
                    No Data Found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const creditDetails = getLatestCreditDetails(item);
                  const combinedCredits = getCombinedCreditDetails(item);
                  
                  return (
                    <tr
                      key={item.return_id || index}
                      className=" hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="border border-gray-200 px-4 py-3 text-[16px]  left-0 bg-white z-10 font-medium">
                        {(currentPage - 1) * parseInt(formData.recordsPerPage) +
                          index +
                          1}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-[16px]  left-0 bg-white z-10 ">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded"
                            title="Edit"
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
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.created_date}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.courier_no}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.transport_name}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.company_name}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.customer_name}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.customer_city}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.no_of_boxes}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {item.box_checked === 1 ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.box_no}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]" title={combinedCredits.credit_nos}>
                        {creditDetails.credit_no}
                        {item.credit_details && item.credit_details.length > 1 && (
                          <span className="ml-1 ttext-[16px] text-blue-600" title={`Multiple credits: ${combinedCredits.credit_nos}`}>
                            (+{item.credit_details.length - 1})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]" title={combinedCredits.credit_dates}>
                        {creditDetails.credit_date}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]" title={combinedCredits.mra_nos}>
                        {creditDetails.mra_no}
                        {item.credit_details && item.credit_details.length > 1 && (
                          <span className="ml-1 text-[16px] text-blue-600" title={`Multiple MRA: ${combinedCredits.mra_nos}`}>
                            (+{item.credit_details.length - 1})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]" title={combinedCredits.mra_dates}>
                        {creditDetails.mra_date}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination using the separate component */}
      {!loading && !noData && totalPages > 1 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 ">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalRecords={totalRecords}
            recordsPerPage={parseInt(formData.recordsPerPage)}
            showInfo={true}
          />
        </div>
      )}

      {!loading && !noData && (
        <div className="text-center mt-4 text-gray-600 text-sm">
          Showing {filteredData.length} of {totalRecords} records
          {totalPages > 1 && ` | Page ${currentPage} of ${totalPages}`}
        </div>
      )}

      {/* Return Model Modal */}
      {isModalOpen && (
        <Returnmodel
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}      
          returnData={selectedReturn}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
};

export default Return;