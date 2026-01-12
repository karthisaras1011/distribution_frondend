import React, { useState, useEffect } from "react";
import Pagination from "../../components/pagination/pagenation";
import { getInwardReport, currentExport, currentExportAll } from "../../service/employee/inwardReport";
import Swal from "sweetalert2";


const Inward = () => {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    recordsPerPage: "50",
  });

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showTable, setShowTable] = useState(false);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getReport = async (page = 1, exportAll = false) => {
    try {
      setLoading(true);
      const params = {
        start_date: form.startDate,
        end_date: form.endDate,
        limit: exportAll ? 0 : form.recordsPerPage, // if exportAll=true, get all data
        page: page,
        search: search || "",
        company_name: "",
        customer_name: "",
        courier_no: "",
      };

      const res = await getInwardReport(params);
      console.log("API RESPONSE 👉", res);

      if (res.data.success) {
        setData(res.data.data || []);
        if (!exportAll) {
          setPagination({
            totalRecords: res.data.pagination?.totalRecords || 0,
            totalPages: res.data.pagination?.totalPages || 1,
            currentPage: res.data.pagination?.currentPage || 1,
          });
          setShowTable(true);
          setCurrentPage(page);
        }
        return res.data.data;
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      alert("Error fetching report data");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Debounce search for company name, customer name, courier no, transport name
  useEffect(() => {
    if (showTable && (form.startDate && form.endDate)) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        getReport(1);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [search]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getReport(page);
  };




  // ✅ Export current page
  // ✅ Export current page
  // ✅ Export current page (fixed)
  // ✅ Export current page (fixed)
  const handleExportCurrent = async () => {
    const confirm = await Swal.fire({
      title: "Export Current Page?",
      text: "This will download the report for the current page.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#a76c6c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Export",
    });


    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const params = {
          start_date: form.startDate,
          end_date: form.endDate,
          limit: form.recordsPerPage,
          page: currentPage,
          search: search || "",
        };

        const downloadUrl = await currentExport(params);
        if (downloadUrl) {
          window.open(downloadUrl, "_blank");
        }


        Swal.fire({
          icon: "success",
          title: "Export Completed!",
          text: "Your current page data has been downloaded.",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Export current error:", err);
        Swal.fire("Export Failed!", "Something went wrong during export.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ Export all pages
  const handleExportAll = async () => {
    const confirm = await Swal.fire({
      title: "Export All Records?",
      text: "This will export all available records. Continue?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#a76c6c",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Export All!",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const params = {
          start_date: form.startDate,
          end_date: form.endDate,
          search: search || "",
        };
        const downloadUrl = await currentExportAll(params);
        if (downloadUrl) {
window.open(downloadUrl, "_blank");

        }



        Swal.fire({
          icon: "success",
          title: "Export Completed!",
          text: "Your full report has been downloaded.",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Export all error:", err);
        Swal.fire({
          icon: "error",
          title: "Export Failed",
          text: "Something went wrong while exporting all records.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter data based on search term for company name, customer name, courier no, transport name
  const filteredData = data.filter(item => {
    if (!search) return true;

    const searchTerm = search.toLowerCase();
    return (
      (item.company_name && item.company_name.toLowerCase().includes(searchTerm)) ||
      (item.customer_name && item.customer_name.toLowerCase().includes(searchTerm)) ||
      (item.courier_no && item.courier_no.toLowerCase().includes(searchTerm)) ||
      (item.transport_name && item.transport_name.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <div className="p-2 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-400 mb-2">
        Inward Cover Report
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end px-2">
          <fieldset className="flex flex-col border border-gray-300 rounded-md px-3 py-1  w-full">
            <legend className="text-xs text-gray-800 px-1">START DATE</legend>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="focus:outline-none"
          />
        </fieldset>

        <fieldset className="flex flex-col border border-gray-300 rounded-md px-3 py-1  w-full">
          <legend className="text-xs text-gray-800 px-1">END DATE</legend>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="focus:outline-none"
          />
        </fieldset>

        <fieldset className="flex flex-col border border-gray-300 rounded-md px-3 py-1  w-full">
          <legend className="text-xs text-gray-800 px-1">RECORDS PER PAGE</legend>
          <select
            name="recordsPerPage"
            value={form.recordsPerPage}
            onChange={(e) => {
              handleChange(e);
              setCurrentPage(1);
              getReport(1);
            }}
            className="focus:outline-none"
          >
            <option value="50">50 (Default)</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="200">500</option>
          </select>
        </fieldset>

        <div className="flex justify-start md:justify-end">
          <button
            onClick={() => getReport(1)}
            disabled={loading}
            className="bg-[#6a1a13] hover:bg-[#865556] text-white font-semibold px-6 py-2 rounded-md shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Report"}
          </button>
        </div>
      </div>

      {/* Table */}
      {showTable && (
        <div className="mt-4">
          <div className="sticky top-0 z-10 bg-white py-2 px-2 shadow-sm mb-2 border rounded-xl border-none">
            <div className="flex flex-col md:flex-row justify-between items-center  gap-3">
              <input
                type="text"
                placeholder="Search Company, Customer, Courier, Transport..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full md:w-1/3 focus:outline-[#6a1a13]"
              />

              {/* ✅ Export Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleExportCurrent}
                  className="bg-[#6a1a13] hover:bg-[#865556] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm"
                >
                  Export Current Page
                </button>
                <button
                  onClick={handleExportAll}
                  className="bg-[#6a1a13] hover:bg-[#865556] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm"
                >
                  Export All
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl border-gray-300 mt-8">
            <table className="min-w-full text-sm text-center">
              <thead className=" bg-gray-100 text-gray-600 uppercase text-xs ">
                <tr>
                  <th className=" px-3 py-4">SNO</th>
                  <th className=" px-3 py-4">CREATED DATE</th>
                  <th className=" px-3 py-4">COMPANY NAME</th>
                  <th className=" px-3 py-4">CUSTOMER NAME</th>
                  <th className=" px-3 py-4">CUSTOMER CITY</th>
                  <th className=" px-3 py-4">COURIER NO</th>
                  <th className=" px-3 py-4">TRANSPORT NAME</th>
                  <th className=" px-3 py-4">COMMENT</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={row.cover_id || index} className="text-black text-[12px] border border-b-2 border-gray-200">
                      <td className=" px-3 py-2 text-[16px]">
                        {(currentPage - 1) * parseInt(form.recordsPerPage) +
                          index +
                          1}
                      </td>
                      <td className=" px-3 py-2 text-[16px]">{row.created_date || '--'}</td>
                      <td className=" px-3 py-2 text-[16px]">{row.company_name || '--'}</td>
                      <td className=" px-3 py-2 text-[16px]">{row.customer_name || '--'}</td>
                      <td className=" px-3 py-2 text-[16px]">{row.customer_city || '--'}</td>
                      <td className=" px-3 py-2 text-[16px]">{row.courier_no || '--'}</td>
                      <td className=" px-3 py-2 text-[16px]">{row.transport_name || '--'}</td>
                      <td className=" px-3 py-2 text-[16px]">{row.comment || '--'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center text-gray-500 py-4 border text-[16px]"
                    >
                      {loading ? "Loading data..." : "No records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                showInfo={true}
                totalRecords={pagination.totalRecords}
                recordsPerPage={parseInt(form.recordsPerPage)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Inward;