import React, { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Trash2 } from 'lucide-react';

const VirtualizedInvoiceTable = ({ data, loading, onDelete, currentPage = 1, recordsPerPage = 50 }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  console.log("Sales TAble: ",data);
  
  // Memoized sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Function to format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="inline ml-1" /> 
      : <FaSortDown className="inline ml-1" />;
  };

  // Calculate starting serial number based on current page
  const getStartingSerialNumber = () => {
    return (currentPage - 1) * recordsPerPage + 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-md mt-6">
        <div className="text-gray-600 text-lg">Loading data...</div>
      </div>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-md mt-6">
        <div className="text-gray-500 text-lg">No invoice data found</div>
      </div>
    );
  }

  return (
    <div className="mx-auto bg-white rounded-lg shadow-md">
      {/* Table Header */}
      <div className="flex  bg-gray-100 text-gray-600 uppercase text-xs ">
        <div 
          className="px-4 py-3 flex-1 min-w-[80px] cursor-pointer flex items-center" 
          onClick={() => handleSort('sno')}
        >
          S.No {getSortIcon('sno')}
        </div>
        <div 
          className="px-4 py-3 flex-1 min-w-[120px] cursor-pointer flex items-center" 
          onClick={() => handleSort('customer_id')}
        >
          CUSTOMER ID {getSortIcon('customer_id')}
        </div>
        <div 
          className="px-4 py-3 flex-1 min-w-[150px] cursor-pointer flex items-center" 
          onClick={() => handleSort('customer_name')}
        >
          CUSTOMER NAME {getSortIcon('customer_name')}
        </div>
        <div 
          className="px-4 py-3 flex-1 min-w-[120px] cursor-pointer flex items-center" 
          onClick={() => handleSort('customer_city')}
        >
          CUSTOMER CITY {getSortIcon('customer_city')}
        </div>
        <div 
          className="px-4 py-3 flex-1 min-w-[150px] cursor-pointer flex items-center" 
          onClick={() => handleSort('company_name')}
        >
          COMPANY NAME {getSortIcon('company_name')}
        </div>
        <div 
          className="px-4 py-3 flex-1 min-w-[120px] cursor-pointer flex items-center" 
          onClick={() => handleSort('invoice_no')}
        >
          INVOICE NO {getSortIcon('invoice_no')}
        </div>
        <div 
          className="px-4 py-3 flex-1 min-w-[120px] cursor-pointer flex items-center" 
          onClick={() => handleSort('invoice_date')}
        >
          INVOICE DATE {getSortIcon('invoice_date')}
        </div>
        <div 
          className="px-4 py-3 flex-1 min-w-[120px] cursor-pointer flex items-center" 
          onClick={() => handleSort('invoice_value')}
        >
          INVOICE VALUE {getSortIcon('invoice_value')}
        </div>
        <div className="px-4 py-3 flex-1 min-w-[100px] flex items-center">ACTION</div>
      </div>

      {/* Table Body - No Virtualization, No Scroll */}
      <div className="w-full">
        {sortedData.map((invoice, index) => (
          <div key={invoice.id || index} className="flex border-b border-gray-200 hover:bg-gray-50 text-[12px]">
            <div className="px-4 py-1 flex-1 min-w-[80px] flex items-center text-[16px]">
              {getStartingSerialNumber() + index}
            </div>
            <div className="px-4 py-1 flex-1 min-w-[120px] flex items-center text-[16px]">
              {invoice.customer_id}
            </div>
            <div className="px-4 py-1 flex-1 min-w-[150px] flex items-center text-[16px]">
              {invoice.customer_name}
            </div>
            <div className="px-4 py-1 flex-1 min-w-[120px] flex items-center text-[16px]">
              {invoice.customer_city}
            </div>
            <div className="px-4 py-1 flex-1 min-w-[150px] flex items-center text-[16px]">
              {invoice.company_name}
            </div>
            <div className="px-4 py-1 flex-1 min-w-[120px] flex items-center text-[16px]">
              {invoice.invoice_no}
            </div>
            <div className="px-4 py-1 flex-1 min-w-[120px] flex items-center text-[16px]">
              {formatDate(invoice.invoice_date)}
            </div>
            <div className="px-4 py-1 flex-1 min-w-[120px] flex items-center text-[16px]">
              {parseFloat(invoice.invoice_value).toFixed(2)}
            </div>
            <div className="px-4 py-1 flex-1 min-w-[100px] flex items-center justify-left text-[16px]">
              <button
                onClick={() => onDelete(invoice)}
                className="text-[#842626] hover:text-red-500 transition-colors"
                aria-label="Delete invoice"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedInvoiceTable;