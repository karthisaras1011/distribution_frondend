import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { returnsReport, exportCurrnt, exportAll } from "../../service/employee/returnReport";
import Pagination from "../../components/pagination/pagenation";
import Swal from "sweetalert2";

const Returnss = () => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    boxNo: "",
    boxStatus: "",
    recordsPerPage: "50",
    search: "",
  });

  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { auth } = useAuth();
  const companyId = auth?.company?.id || "";
  const recordsPerPage = parseInt(formData.recordsPerPage);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "recordsPerPage") setCurrentPage(1);
  };

  // ✅ Prepare parameters for API call
  const buildParams = (page = 1) => {
    const params = {
      company_id: companyId,
      startDate: formData.startDate ? `${formData.startDate} 00:00:00` : undefined,
      endDate: formData.endDate ? `${formData.endDate} 23:59:59` : undefined,
      boxNo: formData.boxNo?.trim() || undefined,
      boxStatus: formData.boxStatus || undefined,
      recordsPerPage: formData.recordsPerPage,
      search: formData.search?.trim() || undefined,
      page,
    };
    // Remove empty fields
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });
    return params;
  };

  // ✅ Fetch report (Get Report button)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCurrentPage(1);

    try {
      const params = buildParams(1);
      console.log("Fetching report with params:", params);

      const response = await returnsReport(params);
      if (response?.success) {
        const data = response.data;
        const rows = Array.isArray(data) ? data : data.data || data.rows || [];
        const total = response.totalRecords || data.total || rows.length || 0;
        const pages = response.totalPages || data.totalPages || Math.ceil(total / recordsPerPage) || 1;

        setReportData(rows);
        setTotalRecords(total);
        setTotalPages(pages);
        setShowTable(true);
      } else {
        setReportData([]);
        setTotalRecords(0);
        setTotalPages(0);
        setShowTable(true);
      }
    } catch (err) {
      console.error("Report fetch error:", err);
      setError("Failed to load report data. Please try again.");
      setReportData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle page change
  const handlePageChange = async (page) => {
    setCurrentPage(page);
    setLoading(true);

    try {
      const params = buildParams(page);
      console.log("Fetching page:", page, "with params:", params);

      const response = await returnsReport(params);
      if (response?.success) {
        const data = response.data;
        const rows = Array.isArray(data) ? data : data.data || data.rows || [];
        const total = response.totalRecords || data.total || rows.length || 0;
        const pages = response.totalPages || data.totalPages || Math.ceil(total / recordsPerPage) || 1;

        setReportData(rows);
        setTotalRecords(total);
        setTotalPages(pages);
      } else {
        setReportData([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Pagination fetch error:", err);
      setError("Failed to load page data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export current page
  const handleCurrentExport = () => {
    const params = buildParams(currentPage);
    Swal.fire({
      title: "Export Current Page?",
      text: "This will download the report for the current page.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#a76c6c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Export",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const downloadUrl = exportCurrnt(params);
          window.open(downloadUrl, "_blank");
          Swal.fire("Export Started!", "Your current page data is being downloaded.", "success");
        } catch {
          Swal.fire("Export Failed!", "Something went wrong during export.", "error");
        }
      }
    });
  };

  // ✅ Export all
  const handleExportAll = () => {
    const params = buildParams();
    Swal.fire({
      title: "Export All Records?",
      text: "This will download the full report (all pages).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#a76c6c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Export All",
    }).then((result) => {
      if (result.isConfirmed) {
        const url = exportAll(params);
        window.open(url, "_blank");
        Swal.fire("Export Started", "Your full report export has started.", "success");
      }
    });
  };

  const startRecord = totalRecords > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  return (
    <div className="max-w-full mx-auto bg-white shadow-md rounded-lg p-2">
      <h2 className="text-xl font-bold text-gray-400 mb-4">RETURNS REPORT</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6 ">
        <fieldset className="flex flex-col border border-gray-300 rounded-md px-3 py-1 w-full">
          <legend className="text-xs text-gray-800 px-1">START DATE</legend>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
        </fieldset>

        <fieldset className="flex flex-col border border-gray-300 rounded-md px-3 py-1 w-full">
          <legend className="text-xs text-gray-800 px-1">END DATE</legend>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
        </fieldset>

        <fieldset className="flex flex-col border border-gray-300 rounded-md px-3 py-1 w-full">
          <legend className="text-xs text-gray-800 px-1">RECORDS PER PAGE</legend>
          <select
            name="recordsPerPage"
            value={formData.recordsPerPage}
            onChange={handleChange}
            className="py-1 text-sm focus:outline-none"
          >
            <option value="50">50 (default)</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </fieldset>

        <fieldset className="flex flex-col col-span-2 border border-gray-300 rounded-md px-3 py-1 w-full">
          <legend className="text-xs text-gray-800 px-1">BOX NO</legend>
          <input
            type="text"
            name="boxNo"
            value={formData.boxNo}
            onChange={handleChange}
            placeholder="Enter Box No"
            className="py-1 text-sm focus:outline-none"
          />
        </fieldset>

        <fieldset className="flex flex-col border border-gray-300 rounded-md px-3 py-1 w-full">
          <legend className="text-xs text-gray-800 px-1">SEARCH</legend>
          <input
            type="text"
            name="search"
            value={formData.search}
            onChange={handleChange}
            placeholder="Search..."
            className="py-1 text-sm focus:outline-none"
          />
        </fieldset>

        <div className="col-span-3 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-[#6a1a13] cursor-not-allowed" : "bg-[#6a1a13] hover:bg-[#865556]"
            } text-white px-6 py-1 rounded-md shadow-md transition-all`}
          >
            {loading ? "Loading..." : "Get Report"}
          </button>

          <button
            type="button"
            onClick={handleCurrentExport}
            className="bg-[#6a1a13] hover:bg-[#865556] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm"
          >
            Export Current
          </button>

          <button
            type="button"
            onClick={handleExportAll}
            className="bg-[#6a1a13] hover:bg-[#865556] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm"
          >
            Export All
          </button>
        </div>
      </form>

      {/* TABLE + PAGINATION */}
      {showTable && (
        <div className="overflow-x-auto mt-10">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400"></div>
              <p className="mt-2 text-gray-600">Loading report data...</p>
            </div>
          ) : (
            <>
              {totalRecords > 0 && (
                <div className="mb-4 text-sm text-gray-600">
                  Showing {startRecord}-{endRecord} of {totalRecords} records
                </div>
              )}

              <table className="min-w-full text-[12px] ">
                <thead className=" bg-gray-100 text-gray-600 uppercase text-xs ">
                  <tr className="text-center  uppercase">
                    <th className=" px-3 py-1">SNO</th>
                    <th className=" px-8 py-1">Created Date</th>
                    <th className=" px-8 py-1">Courier No</th>
                    <th className=" px-8 py-1">Transport</th>
                    <th className=" px-8 py-1">Company</th>
                    <th className=" px-8 py-1">Customer</th>
                    <th className=" px-8 py-1">City</th>
                    <th className=" px-8 py-1">Boxes</th>
                    <th className=" px-8 py-1">Box Checked</th>
                    <th className=" px-8 py-1">Box No</th>
                    <th className=" px-8 py-1">Salable Credit No</th>
                    <th className=" px-8 py-1">Salable Credit Date</th>
                    <th className=" px-8 py-1">EBS Credit No</th>
                    <th className=" px-8 py-1">EBS Credit Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length > 0 ? (
                    reportData.map((row, index) => (
                      <tr key={row.return_id || index} className="hover:bg-gray-50 text-center  ">
                        <td className=" px-3 py-2 text-[16px]">{startRecord + index}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.created_date || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]" >{row.courier_no || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.transport_name || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.company_name || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.customer_name || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.customer_city || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.no_of_boxes || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.box_checked || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.box_no || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.credit_no || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.credit_date || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.mra_no || "-"}</td>
                        <td className=" px-3 py-2 text-[16px]">{row.mra_date || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="14" className="text-center py-4 text-gray-500 text-[16px]">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalRecords={totalRecords}
                    recordsPerPage={recordsPerPage}
                    showFirstLast
                    showPrevNext
                    showPageNumbers
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Returnss;
