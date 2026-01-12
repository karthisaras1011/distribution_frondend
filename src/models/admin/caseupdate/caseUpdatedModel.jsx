import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CaseUpdateModal = ({ 
  isOpen, 
  onClose, 
  caseData, 
  onUpdate, 
  warehousePersons = [], 
  loadingWarehouse = false 
}) => {
  const [selectedWarehousePerson, setSelectedWarehousePerson] = useState('');
  const [noOfCases, setNoOfCases] = useState('');

  // Reset form when modal opens/closes or caseData changes
  useEffect(() => {
    if (isOpen && caseData) {
      setSelectedWarehousePerson(caseData.warehouse_person || '');
      setNoOfCases(caseData.no_of_cases || '');
    } else {
      setSelectedWarehousePerson('');
      setNoOfCases('');
    }
  }, [isOpen, caseData]);

  const handleUpdate = () => {
    const updateData = {
      ...caseData,
      warehouse_person: selectedWarehousePerson,
      no_of_cases: noOfCases
    };
    
    onUpdate(updateData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Edit Cases</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Invoice No */}
          <div>
            <label className="text-sm font-medium text-gray-600">INVOICE NO</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md border">
              <p className="text-gray-800 font-semibold">{caseData?.invoice_no}</p>
              <p className="text-sm text-gray-500 mt-1">{caseData?.invoice_date}</p>
              <p className="text-sm text-gray-500">{caseData?.company_name}</p>
            </div>
          </div>

          {/* Warehouse Person Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-600">WAREHOUSE PERSON</label>
            <div className="mt-1">
              {loadingWarehouse ? (
                <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md">
                  <p className="text-gray-500">Loading warehouse persons...</p>
                </div>
              ) : (
                <select
                  value={selectedWarehousePerson}
                  onChange={(e) => setSelectedWarehousePerson(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                >
                  <option value="">Select Warehouse Person</option>
                  {warehousePersons.map((person, index) => (
                    <option key={index} value={person.employee_name}>
                      {person.employee_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* No of Cases */}
          <div>
            <label className="text-sm font-medium text-gray-600">NO OF CASES</label>
            <div className="mt-1">
              <input
                type="number"
                placeholder="Enter number of cases"
                value={noOfCases}
                onChange={(e) => setNoOfCases(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={!selectedWarehousePerson || !noOfCases}
            className="px-4 py-2 bg-rose-400 text-white rounded-md hover:bg-rose-500 transition disabled:bg-rose-300 disabled:cursor-not-allowed"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseUpdateModal;