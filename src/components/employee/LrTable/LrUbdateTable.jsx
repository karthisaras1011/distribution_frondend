import React, { useState } from "react";
import { Pencil, Trash2, Eye, Loader, Search, Check } from "lucide-react";
import EditModal from "../../../models/employee/LR/EditLrModal";
import ClubbedModal from "../../../models/employee/LR/CluppedModal";
import CaseSplitUpModal from "../../../models/employee/LR/CaseSplitUp";
import Pagination from "../../pagination/pagenation";
import { deleteClub } from "../../../service/employee/lrApi";
import { showError,showSuccess } from "../../../utils/sweetAlert";

// Table Header Component
// Table Header Component
const TableHeader = ({
  title,
  sortable = false,
  onSort,
  sortField,
  sortDirection,
  className = "", // ✅ allow custom className
}) => {
  return (
    <th
      className={`
        px-4 py-3
        text-center
        font-semibold
        text-gray-800
        bg-gray-100
        uppercase
        text-xs
        ${sortable ? "cursor-pointer hover:bg-[#5a1510] hover:text-white" : ""}
        ${className}
      `}
      onClick={sortable ? () => onSort(title) : undefined}
    >
      <div className="flex items-center justify-center gap-1">
        <span>{title}</span>

        {sortable && sortField === title && (
          <span className="text-[10px]">
            {sortDirection === "asc" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </th>
  );
};

// Custom Checkbox Component
const CustomCheckbox = ({ checked, onChange, id, isHeader = false }) => {
  return (
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only" // Hide the native checkbox
      />
      <label
        htmlFor={id}
        className={`flex items-center justify-center w-4 h-4 border border-gray-300 rounded cursor-pointer transition-colors ${
          checked 
            ? 'bg-[#6a1a13] border-[#6a1a13]' 
            : 'bg-white hover:bg-gray-100'
        } ${isHeader ? 'mt-1' : ''}`}
      >
        {checked && (
          <Check size={12} className="text-white" />
        )}
      </label>
    </div>
  );
};

export default function LrUpdateable({
  tableData,
  loading,
  error,
  currentPage,
  totalPages,
  totalRecords,
  recordsPerPage,
  searchTerm,
  onPageChange,
  onRefreshData,
  onDelete,
  onEdit,
  onSelectAll,
  onSelectItem,
  auth,
  onSaveCaseSplitUp
}) {
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [clubbedModalOpen, setClubbedModalOpen] = useState(false);
  const [clubbedData, setClubbedData] = useState(null);
  const [caseSplitUpModalOpen, setCaseSplitUpModalOpen] = useState(false);
  const [caseSplitUpData, setCaseSplitUpData] = useState(null);

  // Check if company type is ELECTRICAL or ELECTRONICS
  const shouldShowCaseSplitUp = () => {
    const companyType = auth?.company?.type || '';
    console.log("Company type for Case Split Up:", companyType);
    
    // Show only for ELECTRICAL and ELECTRONICS companies
    return companyType && 
      (companyType.toUpperCase() === "ELECTRICAL" || 
       companyType.toUpperCase() === "ELECTRONICS");
  };

  // Fixed date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      return dateString;
    }
  };

    const handleDeleteClub = async (referenceNo) => {
    try {
      await deleteClub(referenceNo);
      // Refresh the data after successful deletion
      onRefreshData();
      // Close the modal
      setClubbedModalOpen(false);
      showSuccess("Club deleted successfully");
    } catch (error) {
      console.error("Error deleting club:", error);
      showError(error.response?.data?.message || "Failed to delete club");
    }
  };

  // Format currency for better display
  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle sorting
  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Handle select all checkbox
  const handleSelectAllChange = (e) => {
    const isSelected = e.target.checked;
    onSelectAll(isSelected);
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (id, isSelected) => {
    onSelectItem(id, isSelected);
  };

  // Check if all items are selected
  const isAllSelected = tableData.length > 0 && tableData.every(item => item.selected);

  // Check if some items are selected
  const isSomeSelected = tableData.some(item => item.selected) && !isAllSelected;

  // Filter dynamically across all fields
  const filteredData = tableData.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
  );
console.log("Ohh My God: ",filteredData);

  // Function to get clubbed count from clubbed_from data
  const getClubbedCount = (item) => {
    let clubbedCount = 0;
    try {
      const clubbedFromData = item?.clubbed_from || item?._raw?.clubbed_from;
      if (clubbedFromData) {
        if (Array.isArray(clubbedFromData)) {
          clubbedCount = clubbedFromData.length;
        } else if (typeof clubbedFromData === 'string') {
          const parsed = JSON.parse(clubbedFromData);
          if (Array.isArray(parsed)) {
            clubbedCount = parsed.length;
          }
        }
      }
    } catch (error) {
      console.error("Error parsing clubbed data:", error);
    }
    return clubbedCount;
  };

  const handleEdit = (row) => {
    console.log("Editing row:", row);
    setFormData(row);
    setIsModalOpen(true);
  };

  const handleClubbedClick = (row) => {
    console.log("clkub: ",row);
    
    setClubbedData(row);
    setClubbedModalOpen(true);
  };

  const handleCaseSplitUp = (row) => {
    console.log("Case Split Up row data:", row);
    
    // Access the raw data correctly
    const rawData = row._raw || row;
    const companyType = auth?.company?.type?.toUpperCase() || '';
    console.log("Company type:", companyType);
    console.log("Raw data for Case Split Up:", rawData);
    
    let caseSplitUpData = {};
    
    if (companyType === "ELECTRICAL") {
      caseSplitUpData = {
        conduit: rawData.conduit || 0,
        cables: rawData.cables || 0,
        others: rawData.others || 0
      };
    } else if (companyType === "ELECTRONICS") {
      caseSplitUpData = {
        others: rawData.others || 0,
        stabilizer: rawData.stabilizer || 0,
        waterHeater: rawData.water_heater || 0
      };
    }
    
    setCaseSplitUpData({
      companyName: row.companyName,
      invoiceNo: row.invoiceNo,
      companyId: row.companyId,
      caseSplitUp: caseSplitUpData,
      // Pass the complete raw data
      _raw: rawData
    });
    setCaseSplitUpModalOpen(true);
  };

  const handleDeleteClick = (row) => {   
    onDelete(row);
  };

  const showCaseSplitUp = shouldShowCaseSplitUp();

  // Calculate column span for empty state
  const getColSpan = () => {
    let baseColSpan = 21; // Default columns + checkbox column
    if (showCaseSplitUp) {
      baseColSpan += 1; // Add one more for CASE SPLIT UP column
    }
    return baseColSpan;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin w-8 h-8 text-red-600" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-10 bg-red-50 mx-4 my-4 rounded-lg">
          <p className="font-medium">{error}</p>
          <button
            onClick={onRefreshData}
            className="mt-2 px-4 py-2 bg-amber-950 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full text-center text-[12px]">
              <thead className="sticky top-0 z-10 shadow text-center">
                <tr className="bg-gray-100 text-center">
                  {/* Checkbox column for select all */}
                  <th className="px-4 py-3 text-center font-semibold text-white bg-gray-100 w-12">
                    <div className="flex items-center">
                      <CustomCheckbox
                        id="select-all"
                        checked={isAllSelected}
                        onChange={handleSelectAllChange}
                        isHeader={true}
                      />
                      {isSomeSelected && (
                        <span className="ml-1 text-xs text-white">-</span>
                      )}
                    </div>
                  </th>
                  <TableHeader title="SNO" />
                  <TableHeader title="ACTIONS" />
                  <TableHeader
                    title="COMPANY NAME"
                    sortable
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                  <TableHeader
                    title="CUSTOMER NAME"
                    sortable
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                  <TableHeader
                    title="CUSTOMER CITY"
                    sortable
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                  <TableHeader title="INVOICE NO" />
                  <TableHeader
                    title="INVOICE DATE"
                    sortable
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                  <TableHeader
                    title="INVOICE VALUE"
                    sortable
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                  <TableHeader
                    title="CREATED"
                    sortable
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                  <TableHeader title="COURIER NO" />
                  <TableHeader title="TRANSPORT NAME" />
                  <TableHeader title="REGULAR BOXES" />
                  <TableHeader title="CLUBED BOXES" />
                  {/* Conditionally render CASE SPLIT UP column */}
                  {showCaseSplitUp && (
                    <TableHeader title="CASE SPLIT UP" />
                  )}
                  <TableHeader title="WEIGHT" />
              <TableHeader
                 title="LR NO"
                 className="text-center font-semibold uppercase"
              />
                  <TableHeader
                    title="LR DATE"
                    sortable
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                  <TableHeader title="CHEQUE NO" />
                  <TableHeader title="CHEQUE DATE" />
                  <TableHeader title="COMMENTS" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-black">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        item.selected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/* Checkbox for individual row selection */}
                      <td className="px-4 py-3 text-[16px]">
                        <CustomCheckbox
                          id={`checkbox-${item.id}`}
                          checked={item.selected || false}
                          onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {item.sno}
                      </td>
                      <td className="px-2 py-3 text-[16px]">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="text-[#842626] hover:bg-amber-950 transition-colors duration-200 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {item.companyName}
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {item.customerName}
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {item.customerCity}
                      </td>
                      <td className="px-4 py-3 font-mono text-[16px]">
                        {item.invoiceNo}
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {formatDate(item.invoiceDate)}
                      </td>
                      <td className="px-4 py-3  font-medium text-[16px]">
                        {formatCurrency(item.invoiceValue)}
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {formatDate(item.created)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[16px]">
                        {item.courierNo}
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {item.transportName}
                      </td>
                      <td className="px-4 py-3 text-center text-[16px]">
                        {item.regularBoxes}
                      </td>
                      <td className="px-4 py-3 text-center text-[16px]">
                        <div className="flex items-center justify-between gap-4">
                          <div className=" flex-1 text-right">
                            {item.clubedBoxes}
                          </div>
                          <button
                            onClick={() => handleClubbedClick(item)}
                            className="bg-[#842626] text-white rounded-lg px-3 py-1 flex items-center gap-1 hover:bg-[#865556] transition-colors flex-shrink-0"
                          >
                            <Eye size={14} /> {getClubbedCount(item)}
                          </button>
                        </div>
                      </td>
                      {/* Conditionally render CASE SPLIT UP button */}
                      {showCaseSplitUp && (
                        <td className="px-4 py-3 text-center text-[16px]">
                          <button
                            onClick={() => handleCaseSplitUp(item)}
                            className="bg-[#842626] text-white rounded-lg px-3 py-1 flex items-center gap-1 mx-auto hover:bg-red-600 transition-colors"
                          >
                            <Eye size={14} /> View
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-3 text-[16px]">
                        {item.weight} kg
                      </td>
                      <td className="px-4 py-3 font-mono text-[16px]">
                        {item.lrNo}
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {formatDate(item.lrDate)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[16px]">
                        {item.chequeNo}
                      </td>
                      <td className="px-4 py-3 text-[16px]">
                        {formatDate(item.chequeDate)}
                      </td>
                      <td
                        className="px-4 py-3 max-w-xs truncate text-[16px]"
                        title={item.comments}
                      >
                        {item.comments}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={getColSpan()}
                      className="px-4 py-8 text-center text-gray-500 text-[16px]"
                    >
                      <div className="flex flex-col items-center">
                        <Search size={48} className="text-gray-300 mb-2" />
                        <p className="text-lg font-medium">No records found</p>
                        <p className="text-sm">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and Summary */}
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showInfo={true}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              showFirstLast={true}
              showPrevNext={true}
              showPageNumbers={true}
              className="mb-4"
            />

            <div className="text-sm text-gray-600 text-center">
              Showing{" "}
              <span className="font-medium">
                {filteredData.length > 0 ? 1 : 0}
              </span>{" "}
              to <span className="font-medium">{filteredData.length}</span> of{" "}
              <span className="font-medium">{filteredData.length}</span> entries
              {filteredData.length < tableData.length && (
                <span className="ml-2 text-blue-600">
                  (Filtered from {tableData.length} total records)
                </span>
              )}
              {/* Show selected count */}
              {tableData.some(item => item.selected) && (
                <span className="ml-2 text-[#842626] font-medium">
                  • {tableData.filter(item => item.selected).length} selected
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onSaveSuccess={onEdit}
      />
      <ClubbedModal
        isOpen={clubbedModalOpen}
        onClose={() => setClubbedModalOpen(false)}
        data={clubbedData}
        onDeleteClub={handleDeleteClub}
      />
      <CaseSplitUpModal
        isOpen={caseSplitUpModalOpen}
        onClose={() => setCaseSplitUpModalOpen(false)}
        data={caseSplitUpData}
        companyType={auth?.company?.type} // Pass company type to modal
         onSaveSuccess={onSaveCaseSplitUp}
      />
    </div>
  );
}