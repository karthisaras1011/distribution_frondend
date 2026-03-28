import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "react-toastify";
import CustomerFormModal from "../../models/admin/customer/CustomerFormModal";
import BulkUpdateModal from "../../models/admin/customer/BulkUpdateModal";
import ExportCustomersModal from "../../models/admin/customer/ExportCustomersModal";
import ConfirmationModal from "../../models/admin/ConfirmationModal";
import CustomerTable from "../../components/admin/customer/Customer_Table";
import {
  getCustomers,
  updateCustomerStatus,
  updateAppDeliveryStatus,
  deleteCustomer,
} from "../../service/admin/customerApi";

const Customer = () => {
  const [open, setOpen] = useState(false);
  const [bulkUpdateModal, setBulkUpdateModal] = useState({ open: false, mode: "update" });
  const [exportCustomersModal, setExportCustomerModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mode, setMode] = useState("add");

  const [data, setData] = useState([]);
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState({ id: "no_of_data", desc: true });
  const [isToggling, setIsToggling] = useState({});

  const fetchData = useCallback(async () => {
    let isMounted = true;
    const controller = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageIndex + 1,
        pageSize,
        search: debouncedSearch,
        status: statusFilter === "all" ? "" : statusFilter,
        productType: productTypeFilter,
        sortBy: sortBy.id,
        sortOrder: sortBy.desc ? "DESC" : "ASC",
      };

      const response = await getCustomers(params, { signal: controller.signal });
      console.log("API Response: ", response);

      if (isMounted) {
        if (response.data?.data) {
          // FIX: Transform the data to match UI expectations
          const transformedData = response.data.data.map(customer => ({
            ...customer,
            app_status: customer.delivery_app_status // Map delivery_app_status to app_status
          }));
          
          setData(transformedData);
          setLocalData(transformedData);
          setTotalCount(response.data.pagination.total);
          setPageCount(response.data.pagination.totalPages);
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (err) {
      if (isMounted && err.name !== "AbortError") {
        setError(err.response?.data?.message || err.message || "Failed to fetch customers");
        toast.error("Failed to load customers");
        setData([]);
        setLocalData([]);
        setTotalCount(0);
        setPageCount(0);
      }
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pageIndex, pageSize, debouncedSearch, statusFilter, productTypeFilter, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, statusFilter, productTypeFilter]);

  const handleToggleStatus = useCallback(
    async (status, customerId) => {
      setIsToggling((prev) => ({ ...prev, [customerId]: true }));
      try {
        setLocalData((prevData) =>
          prevData.map((item) =>
            item.customer_id === customerId ? { ...item, customer_status: status } : item
          )
        );
        const response = await updateCustomerStatus(customerId, status);
        if (!response.data.success) throw new Error(response.data.message || "Failed to update status");
        toast.success(status === 1 ? "Status changed to Active" : "Status changed to Inactive");
      } catch (error) {
        setLocalData(data);
        toast.error(`Status update failed: ${error.message}`);
      } finally {
        setIsToggling((prev) => ({ ...prev, [customerId]: false }));
      }
    },
    [data]
  );

  const handleToggleAppDelivery = useCallback(
    async (status, customerId) => {
      setIsToggling((prev) => ({ ...prev, [`app_${customerId}`]: true }));
      try {
        setLocalData((prevData) =>
          prevData.map((item) =>
            item.customer_id === customerId ? { 
              ...item, 
              app_status: status,
              delivery_app_status: status // Also update the original field for consistency
            } : item
          )
        );
        const response = await updateAppDeliveryStatus(customerId, status);
        if (!response.data.success) throw new Error(response.data.message || "Failed to update app status");
        toast.success(status === 1 ? "App Delivery enabled" : "App Delivery disabled");
      } catch (error) {
        setLocalData(data);
        toast.error(`App status update failed: ${error.message}`);
      } finally {
        setIsToggling((prev) => ({ ...prev, [`app_${customerId}`]: false }));
      }
    },
    [data]
  );

  const handleEdit = (customer) => {
    setInitialValues(customer);
    setMode("edit");
    setOpen(true);
  };

  const handleAddCustomer = () => {
    setInitialValues(null);
    setMode("add");
    setOpen(true);
  };

  const handleDeleteClick = (customerId) => {
    setCustomerToDelete(customerId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete);
      toast.success("Customer deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(`Failed to delete customer: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setProductTypeFilter("");
    setPageIndex(0);
  };

  return (
    <div className="p-2">
      {/* Filters & Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-2 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 w-full md:w-64 transition-all duration-200"
          />
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
            disabled={loading}
            className="border border-gray-300 px-3 py-2 text-sm rounded-md transition-colors duration-200"
          >
            {[50, 100, 200, 500, 1000].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
            className="border border-gray-300 px-3 py-2 text-sm rounded-md transition-colors duration-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={productTypeFilter}
            onChange={(e) => setProductTypeFilter(e.target.value)}
            disabled={loading}
            className="border border-gray-300 px-3 py-2 text-sm rounded-md transition-colors duration-200"
          >
            <option value="">All Product Types</option>
            <option value="PHARMA">Pharma</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="ELECTRONICS">Electronics</option>
          </select>

          <button
            onClick={() => setBulkUpdateModal({ open: true, mode: "insert" })}
            disabled={loading}
            className="bg-[#6a1a12] text-white px-4 py-2 text-sm rounded-md hover:bg-[#955d5d] transition-all duration-200"
          >
            Bulk Insert
          </button>

          <button
            onClick={() => setBulkUpdateModal({ open: true, mode: "update" })}
            disabled={loading}
            className="bg-[#6a1a12] text-white px-4 py-2 text-sm rounded-md hover:bg-[#955d5d] transition-all duration-200"
          >
            Bulk Update
          </button>

          <button
            onClick={() => setExportCustomerModal(true)}
            disabled={loading}
            className="bg-[#6a1a12] text-white px-4 py-2 text-sm rounded-md hover:bg-[#955d5d] transition-all duration-200"
          >
            Export
          </button>

          <button
            onClick={handleAddCustomer}
            disabled={loading}
            className="bg-[#6a1a12] text-white px-4 py-2 text-sm rounded-md hover:bg-[#955d5d] transition-all duration-200"
          >
            Add Customer
          </button>
        </div>
      </div>

      {/* Error, Loading & Empty States */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-600 hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a76c6c]"></div>
        </div>
      )}

      {!loading && localData.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" || productTypeFilter
                ? "Try adjusting your search or filter criteria"
                : "There are currently no customers available"}
            </p>
            {(searchTerm || statusFilter !== "all" || productTypeFilter) && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-[#6a1a12] text-white rounded-md hover:bg-[#955d5d]"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && localData.length > 0 && (
        <CustomerTable
          data={localData}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          onToggleAppDelivery={handleToggleAppDelivery}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          onPaginationChange={setPageIndex}
          onSortChange={setSortBy}
          isToggling={isToggling}
        />
      )}

      {/* Modals */}
      {open && (
        <CustomerFormModal
          isOpen={open}
          onClose={() => setOpen(false)}
          initialValues={initialValues}
          refreshData={fetchData}
          mode={mode}
        />
      )}

      {bulkUpdateModal.open && (
        <BulkUpdateModal
          isOpen={bulkUpdateModal.open}
          mode={bulkUpdateModal.mode}
          onClose={() => setBulkUpdateModal({ open: false, mode: "update" })}
          refreshData={fetchData}
        />
      )}

      {exportCustomersModal && (
        <ExportCustomersModal
          isOpen={exportCustomersModal}
          onClose={() => setExportCustomerModal(false)}
        />
      )}

      {deleteModalOpen && (
        <ConfirmationModal
          title="Confirm Delete"
          message="Are you sure you want to delete this customer? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default Customer;