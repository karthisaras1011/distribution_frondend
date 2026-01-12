import { useState } from "react";
import { toast } from 'react-toastify';
import CompanyModal from "../../../models/admin/company/Companymodel";

export const Companysearch = ({ onSearch, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleAddSuccess = (message) => {
    setShowModal(false);
    toast.success(message || 'Company added successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    onRefresh(); // Call the refresh function after success
  };

  return (
    <div className="mb-2">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm">
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#884d51]"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-[#884d51] text-white font-medium rounded-md shadow hover:opacity-90 transition w-full md:w-auto"
        >
          Add New Company
        </button>
      </div>

      {showModal && (
        <CompanyModal 
          onClose={() => setShowModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};