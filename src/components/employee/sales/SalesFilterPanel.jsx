// components/employee/sales/SalesFilterPanel.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { CalendarDays, Search } from "lucide-react";

const SalesFilterPanel = ({ onSubmit, loading }) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    recordsPerPage: '50', // UI dropdown
    limit: 50,            // backend param
    search: ''
  });

  const timeoutRef = useRef(null);
  const lastSubmitRef = useRef(0);

  // Throttled submit
  const throttledSubmit = useCallback((newFilters) => {
    const now = Date.now();
    if (now - lastSubmitRef.current > 1000) { 
      lastSubmitRef.current = now;
      onSubmit(newFilters);
    }
  }, [onSubmit]);

  const updateFilter = useCallback((key, value) => {
    let newFilters = { ...filters, [key]: value };

    // Map recordsPerPage → limit
    if (key === 'recordsPerPage') {
      newFilters = {
        ...newFilters,
        recordsPerPage: value,
        limit: Number(value)
      };
    }

    setFilters(newFilters);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (key === 'search') {
      timeoutRef.current = setTimeout(() => throttledSubmit(newFilters), 500);
    } else {
      throttledSubmit(newFilters);
    }
  }, [filters, throttledSubmit]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className=" bg-gray-200 rounded-xl shadow-md shadow-gray-400 p-2 mt-2">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1">SEARCH</label>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, invoice..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-1 bg-white text-gray-700 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#842626] focus:border-transparent transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1">START DATE</label>
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="w-35 px-2 py-1 focus:outline-none bg-gray-100 text-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#842626] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1">END DATE</label>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="w-35 px-2 py-1 focus:outline-none bg-gray-100 text-gray-700 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#842626] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Records Per Page */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1">RECORDS PER PAGE</label>
          <select
            value={filters.recordsPerPage}
            onChange={(e) => updateFilter('recordsPerPage', e.target.value)}
            className="w-35 px-4 py-1 focus:outline-none bg-white text-gray-700 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#842626] focus:border-transparent transition-all"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
        </div>

        {/* Loading */}
        <div className="flex items-end">
          {loading && (
            <div className="text-[#842626] font-semibold py-2 px-4 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#842626] mr-2"></div>
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesFilterPanel;
