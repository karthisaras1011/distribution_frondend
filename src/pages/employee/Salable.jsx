import React, { useState, useEffect } from "react";
import Pagination from "../../components/pagination/pagenation";
import { getSalable, exportExcel, exportPDF } from "../../service/employee/salable";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";

const Salable = () => {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    boxNo: "",
    searchTerm: "",
    recordsPerPage: "50",
  });
  const { auth } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState("");

  // Fetch data on initial page load
  useEffect(() => {
    const fetchDataOnLoad = async () => {
      await fetchData(1);
    };
    
    fetchDataOnLoad();
  }, []);

  // Auto-fetch data when filters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [
    form.startDate, 
    form.endDate, 
    form.boxNo, 
    form.recordsPerPage,
    form.searchTerm
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Reset to first page when filters change
    if (name !== "recordsPerPage") {
      setCurrentPage(1);
    }
  };

  // Handle page change
  const handlePageChange = async (page) => {
    await fetchData(page);
  };

  // API call function with backend filtering
  const fetchData = async (page = 1) => {
    setIsLoading(true);
    setError("");

    try {
      // Prepare parameters for backend filtering
      const params = {
        company_id: auth?.company?.id,
        page,
        limit: parseInt(form.recordsPerPage),
        start_date: form.startDate || undefined,
        end_date: form.endDate || undefined,
        box_no: form.boxNo || undefined,
        search: form.searchTerm || undefined
      };

      console.log("Fetching data with params:", params);

      const response = await getSalable(params);
      console.log("API Response:", response);

      const data = response.data;

      if (data.success) {
        setReportData(data.data || []);
        setTotalPages(data.pagination?.total_pages || 1);
        setTotalRecords(data.pagination?.total_records || 0);
        setCurrentPage(data.pagination?.current_page || page);

        // Show error if no data found
        if (!data.data || data.data.length === 0) {
          if (form.boxNo) {
            setError(`No records found for Box No: ${form.boxNo}`);
          } else if (form.searchTerm) {
            setError(`No records found for search: "${form.searchTerm}"`);
          } else if (form.startDate || form.endDate) {
            setError("No report data available for the selected date range.");
          } else {
            setError("No report data available.");
          }
        } else {
          setError("");
        }
      } else {
        throw new Error(data.error || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch report data. Please try again.");
      setReportData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Excel function
  const handleExportExcel = async () => {
    if (reportData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "No data available to export!",
        confirmButtonColor: "#f43f5e",
      });
      return;
    }

    // Show loading alert
    Swal.fire({
      title: "Preparing Excel File...",
      text: "Please wait while we generate your Excel report",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const exportParams = {
        company_id: auth?.company?.id,
        start_date: form.startDate,
        end_date: form.endDate,
        box_no: form.boxNo,
        search: form.searchTerm
      };

      const exportUrl = exportExcel(exportParams);

      // Create temporary link for download
      const link = document.createElement("a");
      link.href = exportUrl;
      link.setAttribute(
        "download",
        `salable-report-${new Date().toISOString().split("T")[0]}.xlsx`
      );

      // Simulate click and check if download started
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success message
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Export Successful!",
          text: "Excel file has been downloaded successfully",
          confirmButtonColor: "#10b981",
          timer: 3000,
        });
      }, 1000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Failed to download Excel file. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Export to PDF function
  const handleExportPDF = async () => {
    if (!form.boxNo || form.boxNo.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Box No Required",
        text: "Please enter a Box No to export PDF",
        confirmButtonColor: "#f43f5e",
      });
      return;
    }

    if (reportData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "No data available to export!",
        confirmButtonColor: "#f43f5e",
      });
      return;
    }

    // Show loading alert
    Swal.fire({
      title: "Generating PDF...",
      text: "Please wait while we prepare your PDF report",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const exportParams = {
        box_no: form.boxNo,
        company_id: auth?.company?.id,
        start_date: form.startDate,
        end_date: form.endDate
      };

      const response = await exportPDF(exportParams);

      if (!response.data) {
        throw new Error("Empty response from server");
      }

      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('application/pdf')) {
        const blob = new Blob([response.data], { 
          type: 'application/pdf' 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const filename = `salable-report-box-${form.boxNo}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.setAttribute('download', filename);
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        Swal.fire({
          icon: "success",
          title: "PDF Downloaded!",
          text: "PDF file has been downloaded successfully",
          confirmButtonColor: "#10b981",
          timer: 3000,
        });
        return;
      }

      if (contentType && contentType.includes('application/json')) {
        const jsonText = await new Response(response.data).text();
        const jsonData = JSON.parse(jsonText);
        
        generatePDFFromServerData(jsonData.data);
        Swal.close();
        return;
      }

      throw new Error(`Unexpected response type: ${contentType}`);

    } catch (error) {
      console.error("PDF Export Error:", error);
      
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Failed to generate PDF. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Generate PDF using server JSON data
  const generatePDFFromServerData = (serverData) => {
    const printWindow = window.open("", "_blank");

    const { company, controlInfo, customer, items } = serverData;

    const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SALABLE REPORT</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.3;
          width: 210mm;
          height: 297mm;
        }
        .container {
          padding: 10mm;
          height: 277mm;
          position: relative;
        }
        .header {
          text-align: center;
          margin-bottom: 8mm;
        }
        .header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
          text-decoration: underline;
        }
        .company-address {
          text-align: center;
          margin: 3mm 0;
          font-size: 11px;
        }
        .divider {
          border-top: 1.5px solid #000;
          margin: 3mm 0;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin: 4mm 0;
          font-size: 11px;
        }
        .info-table td {
          padding: 2mm 3mm;
          border: 1px solid #000;
          vertical-align: top;
        }
        .info-table .label {
          font-weight: bold;
          background-color: #f0f0f0;
          width: 20%;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 5mm 0;
          font-size: 10px;
        }
        .data-table th,
        .data-table td {
          border: 1px solid #000;
          padding: 2mm 1mm;
          text-align: left;
        }
        .data-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .condition-sailable { background-color: #d4edda; }
        .condition-spoiled { background-color: #f8d7da; }
        .condition-breakage { background-color: #f8d7da; }
        .condition-expiry { background-color: #fff3cd; }
        .condition-short-expiry { background-color: #ffeeba; }
        .condition-long-expiry { background-color: #cce7ff; }
        
        @media print {
          body { margin: 0; padding: 0; }
          .container { padding: 15mm; height: 267mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h3>SALABLE REPORT</h3>
          <div class="company-name">
            <h2><b>${company.name}</b></h2>
          </div>
          <div class="company-address">
            ${company.address}
          </div>
        </div>

        <div class="divider"></div>

        <table class="info-table">
          <tr>
            <td class="label">Control No</td>
            <td>${controlInfo.controlNo || ""}</td>
          </tr>
          <tr>
            <td class="label">LR No - Date</td>
            <td>${controlInfo.lrNo || ""}</td>
            <td class="label">Register no</td>
            <td>${controlInfo.registerNo || ""}</td>
            <td class="label">Goods recv date</td>
            <td>${controlInfo.goodsReceiveDate || ""}</td>
            <td class="label">Box number</td>
            <td>${controlInfo.boxNumber || ""}</td>
          </tr>
          <tr>
            <td class="label">No of Box</td>
            <td>${controlInfo.noOfBox || ""}</td>
            <td class="label">Reg Date</td>
            <td>${controlInfo.regDate || ""}</td>
            <td class="label">Party ref number</td>
            <td>${controlInfo.partyRefNumber || ""}</td>
            <td class="label">Party date</td>
            <td>${controlInfo.partyDate || ""}</td>
          </tr>
          <tr>
            <td class="label">Customer name</td>
            <td colspan="3">${customer.name || ""}</td>
            <td class="label">Customer city</td>
            <td colspan="3">${customer.city || ""}</td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Material description</th>
              <th>Material</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Quantity</th>
              <th>Free Quantity</th>
              <th>Condition</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => {
              const conditionClass =
                item.condition === "04 Salable" || item.condition === "4"
                  ? "condition-sailable"
                  : item.condition === "03 Spoiled" || item.condition === "3"
                  ? "condition-spoiled"
                  : item.condition === "02 Breakage" || item.condition === "2"
                  ? "condition-breakage"
                  : item.condition === "01 Expiry" || item.condition === "1"
                  ? "condition-expiry"
                  : item.condition === "05 Short Expiry" || item.condition === "5"
                  ? "condition-short-expiry"
                  : item.condition === "06 Long Expiry" || item.condition === "6"
                  ? "condition-long-expiry"
                  : "";

              return `
              <tr>
                <td>${index + 1}</td>
                <td>${item.materialDescription || ""}</td>
                <td>${item.material || ""}</td>
                <td>${item.batch || ""}</td>
                <td>${item.expiry || ""}</td>
                <td>${item.quantity || ""}</td>
                <td>${item.freeQuantity || ""}</td>
                <td class="${conditionClass}">${item.condition || ""}</td>
              </tr>
            `;
            }).join("")}
          </tbody>
        </table>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print PDF
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </div>
    </body>
    </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 1000);

    Swal.fire({
      icon: "success",
      title: "PDF Ready!",
      text: "PDF has been generated and ready for printing",
      confirmButtonColor: "#10b981",
      timer: 3000,
    });
  };

  // Function to get condition badge color
  const getConditionColor = (condition) => {
    const conditionStr = String(condition);
    switch (conditionStr) {
      case "4":
      case "Salable":
        return "bg-green-100 text-green-800";
      case "3":
      case "Spoiled":
        return "bg-red-100 text-red-800";
      case "2":
      case "Breakage":
        return "bg-red-100 text-red-800";
      case "5":
      case "Short Expiry":
        return "bg-yellow-100 text-yellow-800";
      case "6":
      case "Long Expiry":
        return "bg-blue-100 text-blue-800";
      case "1":
      case "Expiry":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-2 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold text-gray-400 mb-2">
        SALABLE REPORT
      </h2>

      {/* All Controls in One Line */}
      <div className="sticky top-0 z-20 bg-gray-100 p-2 shadow-xl border border-none rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
          {/* Search */}
          <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
            <legend className="text-xs text-gray-800 px-1">SEARCH</legend>
            <input
              type="text"
              name="searchTerm"
              placeholder="Search..."
              value={form.searchTerm}
              onChange={handleChange}
              className="w-full focus:outline-none text-sm"
            />
          </fieldset>

          {/* Start Date */}
          <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
            <legend className="text-xs text-gray-800 px-1">START DATE</legend>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full focus:outline-none text-sm"
            />
          </fieldset>

          {/* End Date */}
          <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
            <legend className="text-xs text-gray-800 px-1">END DATE</legend>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full focus:outline-none text-sm"
            />
          </fieldset>

          {/* Box No */}
          <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
            <legend className="text-xs text-gray-800 px-1">BOX NO</legend>
            <input
              type="text"
              name="boxNo"
              placeholder="Enter Box No"
              value={form.boxNo}
              onChange={handleChange}
              className="w-full focus:outline-none text-sm"
            />
          </fieldset>

          {/* Records per Page */}
          <fieldset className="border border-gray-300 rounded-md px-3 py-1 hover:border-[#6a1a13] w-full">
            <legend className="text-xs text-gray-800 px-1">PER PAGE</legend>
            <select
              name="recordsPerPage"
              value={form.recordsPerPage}
              onChange={handleChange}
              className="w-full focus:outline-none text-sm"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </fieldset>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={reportData.length === 0}
            className={`h-[42px] font-medium px-3 py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-1 text-sm ${
              reportData.length === 0 
                ? "bg-[#6a1a13] text-white cursor-not-allowed" 
                : "bg-[#6a1a13] hover:bg-[#865556] text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={!form.boxNo || form.boxNo.trim() === "" || reportData.length === 0}
            className={`h-[42px] font-medium px-3 py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-1 text-sm ${
              !form.boxNo || form.boxNo.trim() === "" || reportData.length === 0
                ? "bg-[#6a1a13] text-white cursor-not-allowed" 
                : "bg-[#6a1a13] hover:bg-[#865556] text-white"
            }`}
            title={!form.boxNo || form.boxNo.trim() === "" ? "Enter Box No to export PDF" : ""}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Data Table */}
      {reportData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Salable Report Data
            <span className="text-sm text-gray-500 ml-2">
              Showing {reportData.length} of {totalRecords} records
              {form.searchTerm && ` for search: "${form.searchTerm}"`}
              {form.boxNo && ` for Box No: "${form.boxNo}"`}
            </span>
          </h3>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 texet-[12px]">
              <thead className=" bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-2 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    CREATED
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    COMPANY NAME
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    CUSTOMER NAME
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    CUSTOMER CITY
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    MATERIAL
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    DESCRIPTION
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    BATCH NO
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    EXPIRY
                  </th>
                   <th className="p-2 uppercase tracking-wider">
                    BOX NO
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    QUANTITY
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    FREE QUANTITY
                  </th>
                  <th className="p-2 uppercase tracking-wider">
                    CONDITION
                  </th>
                 
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-[12px]">
                {reportData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 ">
                    <td className="px-4 py-3 text-center text-[16px]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.created_date ? new Date(item.created_date).toLocaleDateString("en-GB") : "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.company_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.customer_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.customer_city || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.material || item.productName || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.batch_no || "-"}
                    </td>
                     <td className="px-4 py-3 text-center text-[16px]">
                             {item.expiry_date || item.expiry || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
              {item.box_no || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.qty || "0"}
                    </td>
                    <td className="px-4 py-3 text-center text-[16px]">
                      {item.free_qty || "0"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[16px]">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition_type)}`}>
                        {item.condition_type || "-"}
                      </span>
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!isLoading && reportData.length === 0 && error && (
        <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 text-center py-8">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            <span className="ml-3 text-gray-600">Loading report data...</span>
          </div>
        </div>
      )}

      {/* Pagination Component */}
      {reportData.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={true}
            showFirstLast={true}
            showPrevNext={true}
            showInfo={true}
            totalRecords={totalRecords}
            recordsPerPage={parseInt(form.recordsPerPage)}
            className="mt-4"
            buttonClassName="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            activeButtonClassName="bg-rose-500 text-white border-rose-500"
            disabledButtonClassName="bg-gray-100 text-gray-400 border-gray-200"
          />
        </div>
      )}
    </div>
  );
};

export default Salable;