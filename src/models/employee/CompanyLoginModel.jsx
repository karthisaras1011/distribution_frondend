import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getLoginCompanies } from '../../service/employee/loginCompany';

export const CompanyLoginModel = ({ isOpen, onClose }) => {
  const { setCompany } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getLoginCompanies();
      console.log("ComLogin: ", response.data.data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch companies');
      }

      setCompanies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to load companies. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (!selectedCompany) return;
    
    try {
      // Pass only the company ID to setCompany function
      const success = await setCompany(selectedCompany.company_id);
      
      console.log("Company set result: ", success);
      
      if (success) {
        // Store company type in localStorage for the table component to use
        localStorage.setItem('currentCompanyType', selectedCompany.type || '');
        
        onClose();
        navigate('/employee/inn');
      } else {
        throw new Error('Failed to set company');
      }
    } catch (error) {
      console.error('Error setting company:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to set company. Please try again.'
      );
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(e.target.value.length > 0);
    // Clear selection if search term changes
    if (selectedCompany && e.target.value !== selectedCompany.company_name) {
      setSelectedCompany(null);
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSearchTerm(company.company_name);
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Company</h2>

        {/* Display loading state */}
        {loading && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            Loading companies...
          </div>
        )}

        {/* Display error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
          
        <div className="mb-4 relative">
          <input
            id="company-search"
            type="text"
            placeholder="Search companies..."
            className="w-full px-4 py-2 border rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(searchTerm.length > 0 && !selectedCompany)}
          />
          
          {/* Dropdown for search results */}
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto">
              {filteredCompanies.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredCompanies.map((company) => (
                    <li 
                      key={company.id || company.company_id || `company-${company.no_of_data}`}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedCompany?.id === company.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleCompanySelect(company)}
                    >
                      <div className="font-medium">{company.company_name}</div>
                      {company.type && (
                        <div className="text-sm text-gray-500">Type: {company.type}</div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-gray-500">No matching companies found</div>
              )}
            </div>
          )}
        </div>

        {/* Display selected company info */}
        {selectedCompany && (
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <div className="font-medium text-green-800">Selected Company:</div>
            <div>{selectedCompany.company_name}</div>
            {selectedCompany.type && (
              <div className="text-sm text-green-600">Type: {selectedCompany.type}</div>
            )}
          </div>
        )}
       
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Logout
          </button>
          <button
            type="button"
            className={`px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors ${
              !selectedCompany ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleProceed}
            disabled={!selectedCompany}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};