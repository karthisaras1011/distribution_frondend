import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const VehicleModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  loading,
  editData = null 
}) => {
  const [vehicleData, setVehicleData] = useState({
    vehicle_number: "",
    type: "Own Vehicle"
  });

  const vehicleTypes = ["Own Vehicle", "Rental Vehicle", "Acid Vehicle"];

  // Reset form when modal opens/closes or editData changes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Edit mode - populate with existing data
        setVehicleData({
          vehicle_number: editData.number || "",
          type: editData.type || "Own Vehicle"
        });
      } else {
        // Add mode - reset form
        setVehicleData({
          vehicle_number: "",
          type: "Own Vehicle"
        });
      }
    }
  }, [isOpen, editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(vehicleData, editData?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {editData ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Vehicle Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VEHICLE NUMBER
            </label>
            <input
              type="text"
              name="vehicle_number"
              value={vehicleData.vehicle_number}
              onChange={handleInputChange}
              placeholder="Enter vehicle number"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B37A83] focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* Vehicle Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VEHICLE TYPE
            </label>
            <select
              name="type"
              value={vehicleData.type}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B37A83] focus:border-transparent"
              required
              disabled={loading}
            >
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#6a1a12] text-white py-2 px-4 rounded-md hover:bg-[#9c656e] transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editData ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editData ? 'Update Vehicle' : 'Add Vehicle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleModal;