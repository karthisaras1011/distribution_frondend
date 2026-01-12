import { useState, useEffect } from "react";
import { exportCustomers, getCompanies } from "../../../service/admin/customerApi";
import { toast } from "react-toastify";

const ExportCustomersModal = ({ isOpen, onClose }) => {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companyError, setCompanyError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    setCompanyError(null);
    try {
      const response = await getCompanies();

      setCompanies(response.data.data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      setCompanyError("Failed to load companies. Please try again.");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleExport = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }

    setIsExporting(true);
    try {
      const response = await exportCustomers(selectedCompany);
      
      // Create download link
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/vnd.ms-excel' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customer_export_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Export successful!");
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error.response?.data?.message || "Failed to export customers");
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/50 bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold"
          disabled={isExporting}
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Select Company</h2>

        {/* Dropdown */}
       <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-1 focus:ring-gray-400"
          disabled={isExporting || loadingCompanies}
        >
          <option value="">--SELECT COMPANY--</option>
          {loadingCompanies ? (
            <option disabled>Loading companies...</option>
          ) : companyError ? (
            <option disabled>{companyError}</option>
          ) : (
            companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))
          )}
        </select>
        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !selectedCompany}
            className="bg-[#a76c6c] hover:bg-[#955d5d] text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export Customers'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportCustomersModal;