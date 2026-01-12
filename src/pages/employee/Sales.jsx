import React, { useState, useEffect, useCallback } from "react";
import VirtualizedInvoiceTable from "../../components/employee/sales/InvoiceTable";
import { SaleDetailsForm } from "../../components/employee/sales/SaleDetailsForm";
import SalesFilterPanel from "../../components/employee/sales/SalesFilterPanel";
import Pagination from "../../components/pagination/pagenation";
import { getInvoiceData, deleteInvoice } from "../../service/employee/sales";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import { Download, Plus, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";

const Sales = () => {
  const { auth } = useAuth();
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalPages: 1,
    totalRecords: 0,
  });
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    search: "",
    limit: 50,
    recordsPerPage: "50",
  });

  const fetchData = useCallback(
    async (page = 1, filterParams = {}) => {
      if (!auth.company) return;

      try {
        setLoading(true);
        setError(null);

        const mergedFilters = { ...filters, ...filterParams };

        const response = await getInvoiceData(
          auth.company.id,
          page,
          mergedFilters.limit,
          mergedFilters.startDate,
          mergedFilters.endDate,
          mergedFilters.search
        );
console.log("Sales Vanten: ",response);

        if (response.data.success) {
          setInvoiceData(response.data.data || []);
          setPagination({
            page: response.data.currentPage,
            limit: response.data.limit,
            totalPages: response.data.totalPages,
            totalRecords: response.data.totalRecords,
          });
          setFilters(mergedFilters);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch invoice data"
          );
        }
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    },
    [auth.company, filters]
  );

  useEffect(() => {
    if (auth.company) {
      fetchData();
    }
  }, [auth.company]);

  const handleFilterSubmit = useCallback(
    (newFilters) => {
      fetchData(1, newFilters);
    },
    [fetchData]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      fetchData(newPage);
    },
    [fetchData]
  );

  const handleDelete = useCallback(
    async (invoice) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Delete invoice ${invoice.invoice_no}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        try {
          console.log("Delte: ",invoice.sales_id);
          
          const response = await deleteInvoice(
           invoice.sales_id
          );

          if (response.data.success) {
            Swal.fire({
              title: "Deleted!",
              text: "Invoice deleted successfully",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            fetchData(pagination.page);
          } else {
            Swal.fire(
              "Error!",
              response.data.message || "Failed to delete invoice",
              "error"
            );
          }
        } catch (error) {
          console.error("Error deleting invoice:", error);
          Swal.fire("Error!", "Something went wrong while deleting.", "error");
        }
      }
    },
    [pagination.page, fetchData]
  );

   const handleDownloadExcel = useCallback(async () => {
  try {
    Swal.fire({
      title: "Preparing Excel File...",
      text: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    Swal.close();

    Swal.fire({
      title: "Download Ready!",
      icon: "success",
      timer: 1800,
      showConfirmButton: false,
    });

    // Sample Excel data
    const excelData = [
      ["Inv No", "Inv Dt", "Cust Id", "Net Amnt"],
      ["", "", "", ""],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, "default_template.xlsx");

  } catch (error) {
    console.error("Error downloading Excel:", error);
    Swal.fire("Error!", "Failed to download Excel file.", "error");
  }
}, [auth.company, filters]);  const handleRefresh = useCallback(() => {
    fetchData(pagination.page);
  }, [fetchData, pagination.page]);

  return (
    <div className="">
      {/* Header Section */}
      <div className="bg-white border-gray-200">
        <div className=" ">
          <div className="flex justify-between items-center mt-2 px-2">
            <div>
              <h1 className="text-xl font-bold text-gray-400">
                SALES DETAILS
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadExcel}
                // disabled={loading || invoiceData.length === 0}
                className="inline-flex items-center px-4 py-2 bg-[#6a1a13] text-white font-medium rounded-lg hover:bg-[#865556] focus:outline-none focus:ring-offset-2 transition-colors duration-200 "
              >
                <Download size={18} className="mr-2" />
                Download Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="  ">
        {/* Sale Details Form */}
        <div className="">
          <SaleDetailsForm onUploadComplete={handleRefresh} />
        </div>

        {/* Filter Panel */}
        <div className="mb-6 sticky top-0 z-10 bg-white shadow-md">
          <SalesFilterPanel onSubmit={handleFilterSubmit} loading={loading} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && invoiceData.length > 0 && (
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalRecords
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.totalRecords}</span>{" "}
              results
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw size={14} />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* Invoice Table */}
        <div>
          <VirtualizedInvoiceTable
            data={invoiceData}
            loading={loading}
            onDelete={handleDelete}
            currentPage={pagination.page}
            recordsPerPage={pagination.limit}
          />
        </div>

        {/* Pagination */}
        {!loading && invoiceData.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              showInfo={true}
              totalRecords={pagination.totalRecords}
              recordsPerPage={pagination.limit}
              showFirstLast={true}
              showPrevNext={true}
              showPageNumbers={true}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && invoiceData.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-500 mb-6">
                No invoices match your current filters. Try adjusting your
                search criteria or create a new invoice.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() =>
                    setFilters({
                      startDate: "",
                      endDate: "",
                      search: "",
                      limit: 50,
                      recordsPerPage: "50",
                    })
                  }
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Clear Filters
                </button>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
