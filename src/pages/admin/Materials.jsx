import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { HiArrowDownTray, HiArrowUpTray } from "react-icons/hi2";
import Pagination from "../../components/pagination/pagenation";
import {
  getMaterials,
  uploadMaterials,
  exportMaterials,
  exportCompany,
} from "../../service/admin/meterial";
import { getCompanies } from "../../service/admin/customerApi";
import Swal from "sweetalert2";

const Materials = () => {
  const [companyName, setCompanyName] = useState("");

  const [companies, setCompanies] = useState([]); // ✅ company list
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingCompany, setExportingCompany] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 50;

  useEffect(() => {
    fetchCompanies(); // ✅ Load companies in dropdown
    fetchMaterials(searchTerm);
  }, [currentPage, searchTerm]);

  // ✅ Clear company selection initially
  useEffect(() => {
    setCompanyName("");
  }, []);

  // ✅ Clear company when search is cleared
  useEffect(() => {
    if (!searchTerm) {
      setCompanyName("");
    }
  }, [searchTerm]);

  // ✅ Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      console.log("Company API Response:", response);

      // ✅ Adjust structure based on API result in your console
      const companyList = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      // ✅ Convert array of names into { id, company_name }
      const formattedCompanies = companyList.map((name, index) => ({
        id: index + 1,
        company_name: name,
      }));

      setCompanies(formattedCompanies);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    }
  };

  const fetchMaterials = async (search = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await getMaterials(currentPage, recordsPerPage, search);
      console.log(response, "response");

      if (response.success) {
        setMaterials(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.totalPages || 0);
        setTotalRecords(response.totalRecords || 0);

        // ✅ REMOVED auto-setting company info to prevent override
      } else {
        throw new Error("Failed to fetch materials");
      }
    } catch (err) {
      setError("Failed to fetch materials");
      console.error("Error fetching materials:", err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !file) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select a company and choose a file!",
        confirmButtonColor: "#f8bb86",
      });
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("file", file);

      await uploadMaterials(formData);

      // ✅ Clear form after successful upload
      setCompanyName("");
      setFile(null);
      
      // ✅ Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      // ✅ Show success alert
      await Swal.fire({
        icon: "success",
        title: "Upload Successful!",
        text: "File uploaded successfully!",
        confirmButtonColor: "#3085d6",
      });

      setCurrentPage(1);
      fetchMaterials();
    } catch (err) {
      console.error("Error uploading file:", err);
      
      // ✅ Check if it's a duplicate file error
      if (err.response?.data?.message?.includes("already exists") || 
          err.message?.includes("already exists") ||
          err.response?.status === 409) {
        
        await Swal.fire({
          icon: "warning",
          title: "File Already Exists",
          text: "This file has already been uploaded. Please upload a different file.",
          confirmButtonColor: "#f8bb86",
        });
      } else {
        setError("Failed to upload file");
        await Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Failed to upload file. Please try again.",
          confirmButtonColor: "#d33",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    // Clear company selection when search is empty
    if (!value) {
      setCompanyName("");
    }

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchMaterials(value);
    }, 500);
  };

  // ✅ Export All Report
  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      const exportUrl = await exportMaterials();

      const link = document.createElement("a");
      link.href = exportUrl;
      link.setAttribute(
        "download",
        `all-materials-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        icon: "success",
        title: "Download Complete",
        text: "All materials report downloaded successfully!",
        confirmButtonColor: "#3085d6",
      });
    } catch (err) {
      console.error("Error exporting all report:", err);
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Something went wrong while exporting the report.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setExportingAll(false);
    }
  };

  // ✅ Export Company Report (using company name)
  const handleExportCompany = async () => {
    if (!searchTerm.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Company Not Found",
        text: "Please search a company name first.",
        confirmButtonColor: "#f8bb86",
      });
      return;
    }

    setExportingCompany(true);
    try {
      const exportUrl = await exportCompany({ search: searchTerm.trim() });

      const link = document.createElement("a");
      link.href = exportUrl;
      link.setAttribute(
        "download",
        `${searchTerm.trim().replace(/\s+/g, "_")}-report-${new Date()
          .toISOString()
          .split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        icon: "success",
        title: "Download Complete",
        text: `${searchTerm} report downloaded successfully!`,
        confirmButtonColor: "#3085d6",
      });
    } catch (err) {
      console.error("Error exporting company report:", err);
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Something went wrong while exporting the company report.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setExportingCompany(false);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const getMaterialKey = (mat, index) =>
    mat.no_of_data
      ? `material-${mat.no_of_data}`
      : mat.material && mat.batch_no
      ? `${mat.material}-${mat.batch_no}`
      : `material-${index}`;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const [day, month, year] = dateString.split("-");
      return new Date(`${year}-${month}-${day}`).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      {error && (
        <div className="bg-red-100 border border-[#6a1a12] text-red-700 px-4 py-3 rounded mb-2 w-full max-w-8xl">
          {error}
        </div>
      )}

      {/* ---------- IMPORT FILE ---------- */}
      <div className="p-2 w-full max-w-8xl mb-2">
        <h1 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
          <HiArrowDownTray className="text-[#6a1a12]" size={28} />
          Import EBS File
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Company Name
            </label>
            {/* ✅ Dropdown fixed */}
            <select
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.company_name}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>
              
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Accept .csv only (remove header before upload)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-lg px-3 py-2 cursor-pointer file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded-md file:bg-[#6a1a12] file:text-white "
              required
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-[#6a1a12] hover:bg-[#955d5d] disabled:bg-gray-400 text-white font-semibold px-6  rounded-lg shadow-md transition-all mt-6"
          >
            {uploading ? "Uploading..." : "Upload EBS"}
          </button>
        </form>
      </div>

      {/* ---------- SEARCH & EXPORT ---------- */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-8xl flex justify-between items-center">
        <div className="flex items-center w-full sm:w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-400">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search by material, company, description, or batch number"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full focus:outline-none text-gray-700"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportAll}
            disabled={exportingAll || materials.length === 0}
            className="bg-[#6a1a12] hover:bg-[#955d5d] disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            <HiArrowUpTray size={20} />
            {exportingAll ? "Exporting..." : "Export All Report"}
          </button>

          <button
            onClick={handleExportCompany}
            disabled={exportingCompany || materials.length === 0}
            className="bg-[#6a1a12] hover:bg-[#955d5d] disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            <HiArrowUpTray size={20} />
            {exportingCompany ? "Exporting..." : "Export Company"}
          </button>
        </div>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-8xl mt-2">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Materials List{" "}
          {totalRecords > 0 && `(${totalRecords.toLocaleString()} records)`}
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a76c6c] mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading materials...</p>
          </div>
        ) : (
          <>
          <div className="relative rounded-xl shadow-sm border border-gray-200 mt-4">
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-hide">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10" >
                <tr>
                  <th className=" p-3 text-left">SNO</th>
                  <th className=" p-3 text-left">Material</th>
                  <th className=" p-3 text-left">Company Name</th>
                  <th className=" p-3 text-left">Description</th>
                  <th className=" p-3 text-left">Batch No</th>
                  <th className=" p-3 text-left">Expiry Date</th>
                  <th className=" p-3 text-left">Created Date</th>
                </tr>
              </thead>

              <tbody>
                {materials.length > 0 ? (
                  materials.map((mat, index) => (
                    <tr
                      key={getMaterialKey(mat, index)}
                      className="hover:bg-gray-50 text-gray-700  cursor-pointer"
                    >
                      <td className="border border-gray-200 px-4 py-3 text-[16px]  left-0 bg-white z-10 font-medium">
                        {(currentPage - 1) * recordsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{mat.material || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{mat.company_name || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{mat.description || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">{mat.batch_no || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {formatDate(mat.expiry_date)}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-[16px]">
                        {formatDate(mat.created_date)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-4">
                      {searchTerm
                        ? "No materials found matching your search"
                        : "No materials available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
            </div>

            {materials.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  totalRecords={totalRecords}
                  recordsPerPage={recordsPerPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Materials;