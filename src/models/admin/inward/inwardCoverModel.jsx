import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

const InwardCoverModal = ({ isOpen, onClose, onSave, data, loading = false, companies = [] }) => {
  const [formData, setFormData] = useState({
    companyId: "",
    companyName: "",
    customerName: "",
    customerCity: "",
    courierNo: "",
    transportName: "",
    comments: ""
  });

  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  // Initialize form when data changes or modal opens
  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        companyId: data.companyId || data.company_id || "",
        companyName: data.companyName || data.company_name || data.company || "",
        customerName: data.customerName || data.customer_name || data.customer || "",
        customerCity: data.customerCity || data.city || data.customer_city || "",
        courierNo: data.courierNo || data.courier_no || data.tracking_number || "",
        transportName: data.transportName || data.transport_name || data.courier_name || "",
        comments: data.comment || data.remarks || data.notes || ""
      });
      setCompanySearch(data.companyName || data.company_name || data.company || "");
    }
  }, [data, isOpen]);

  // Filter companies based on search
  useEffect(() => {
    if (companySearch.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((company) => {
        const searchLower = companySearch.toLowerCase();
        const name = company.name?.toLowerCase() || "";
        const companyName = company.company_name?.toLowerCase() || "";
        
        return (
          name.includes(searchLower) ||
          companyName.includes(searchLower)
        );
      });
      setFilteredCompanies(filtered);
    }
  }, [companySearch, companies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanySearchChange = (e) => {
    const value = e.target.value;
    setCompanySearch(value);
    setShowCompanyDropdown(true);
  };

  const handleCompanySelect = (company) => {
    const companyName = company.name || company.company_name || "";
    const companyId = company.id || company.company_id || "";
    
    setFormData(prev => ({
      ...prev,
      companyId: companyId,
      companyName: companyName
    }));
    setCompanySearch(companyName);
    setShowCompanyDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate company selection
    if (!formData.companyId) {
      alert("Please select a company from the dropdown");
      return;
    }
    
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      companyId: "",
      companyName: "",
      customerName: "",
      customerCity: "",
      courierNo: "",
      transportName: "",
      comments: ""
    });
    setCompanySearch("");
    setShowCompanyDropdown(false);
    onClose();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.company-dropdown-modal')) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-500">
            Edit Inward Cover
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name with Dropdown */}
            <div className="md:col-span-2 company-dropdown-modal relative">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                COMPANY NAME *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companySearch}
                  onChange={handleCompanySearchChange}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors"
                  placeholder="Search and select company..."
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <ChevronDown size={20} />
                </div>
                
                {showCompanyDropdown && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-300 max-h-48 overflow-y-auto rounded-md shadow-lg mt-1">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map((company) => (
                        <li
                          key={company.id || company.company_id}
                          onClick={() => handleCompanySelect(company)}
                          className="p-3 text-sm text-gray-800 hover:bg-rose-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{company.name || company.company_name}</div>
                          {company.email && (
                            <div className="text-xs text-gray-500">{company.email}</div>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-gray-500 text-sm">No companies found</li>
                    )}
                  </ul>
                )}
              </div>
              <input
                type="hidden"
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
              />
            </div>

            {/* Customer Name */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                CUSTOMER NAME
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors"
                placeholder="Enter customer name"
              />
            </div>

            {/* Customer City */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                CUSTOMER CITY
              </label>
              <input
                type="text"
                name="customerCity"
                value={formData.customerCity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors"
                placeholder="Enter customer city"
              />
            </div>

            {/* Courier No */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                COURIER NO
              </label>
              <input
                type="text"
                name="courierNo"
                value={formData.courierNo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors"
                placeholder="Enter courier number"
              />
            </div>

            {/* Transport Name */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                TRANSPORT NAME
              </label>
              <input
                type="text"
                name="transportName"
                value={formData.transportName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors"
                placeholder="Enter transport name"
              />
            </div>

            {/* Comments */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                COMMENTS
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors resize-none"
                placeholder="Enter comments"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.companyId}
              className="px-6 py-2.5 bg-[#6a1a12] text-white rounded-lg hover:bg-[#955d5d] transition-colors duration-200 font-medium disabled:bg-rose-300 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InwardCoverModal;