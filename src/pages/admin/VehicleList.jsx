import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { getVehicle, insertVihicle, updateVehicle, deleteVehicle } from "../../service/admin/vehicle";
import Swal from "sweetalert2";
import VehicleModal from "../../models/admin/vehicle/vehicleModal";

const VehicleList = () => {
  const [search, setSearch] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [vehicleData, setVehicleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: search || undefined,
        limit: recordsPerPage
      };

      const response = await getVehicle(params);
      
      if (response.data && response.data.success) {
        const apiVehicles = response.data.vehicles || [];
        const formattedVehicles = apiVehicles.map(vehicle => ({
          id: vehicle.id,
          number: vehicle.vehicle_number,
          type: vehicle.type
        }));
        setVehicleData(formattedVehicles);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load vehicles');
      setVehicleData([]);
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchVehicles();
  };

  // Records per page change handler
  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setRecordsPerPage(value);
    fetchVehicles();
  };

  // Modal handlers
  const openAddModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setSubmitLoading(false);
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonColor: '#B37A83',
      timer: 3000
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      confirmButtonColor: '#B37A83'
    });
  };

  const showConfirmAlert = (message, onConfirm) => {
    Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B37A83',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  // Handle form submission (API calls here)
  const handleSubmit = async (vehicleData, vehicleId) => {
    try {
      setSubmitLoading(true);
      
      const payload = {
        vehicle_number: vehicleData.vehicle_number.trim(),
        type: vehicleData.type
      };

      let response;
      
      if (vehicleId) {
        // Edit existing vehicle - id kuda send pannrom
        payload.id = vehicleId;
        response = await updateVehicle(payload);
      } else {
        // Add new vehicle
        response = await insertVihicle(payload);
      }
      
      if (response.data && response.data.success) {
        const successMessage = vehicleId 
          ? 'Vehicle Updated Successfully!' 
          : 'Vehicle Added Successfully!';
        
        showSuccessAlert(successMessage);
        fetchVehicles(); // Refresh the list
        closeModal();
      } else {
        throw new Error(response.data?.message || 'Failed to save vehicle');
      }
    } catch (err) {
      console.error('Error saving vehicle:', err);
      showErrorAlert(err.response?.data?.message || err.message || 'Failed to save vehicle');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (vehicleId, vehicleNumber) => {
    showConfirmAlert(
      `Are you sure you want to delete vehicle ${vehicleNumber}?`,
      async () => {
        try {
          const response = await deleteVehicle(vehicleId);
          
          if (response.data && response.data.success) {
            showSuccessAlert('Vehicle deleted successfully!');
            fetchVehicles(); // Refresh the list
          } else {
            throw new Error(response.data?.message || 'Failed to delete vehicle');
          }
        } catch (err) {
          console.error('Error deleting vehicle:', err);
          showErrorAlert(err.response?.data?.message || err.message || 'Failed to delete vehicle');
        }
      }
    );
  };

  // Safe filter function with null checks
  const filteredData = vehicleData.filter((v) => {
    const vehicleNumber = v.number || '';
    const searchTerm = search || '';
    return vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
  <div className="p-6 bg-white min-h-screen">

    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-gray-700">Vehicle List</h1>

      <button
        onClick={openAddModal}
        className="flex items-center gap-2 bg-[#6a1a12] text-white px-5 py-2.5 rounded-lg shadow hover:bg-[#8d3a30] transition"
      >
        <Plus size={18} /> Add New Vehicle
      </button>
    </div>

    {/* Search Bar */}
    <form onSubmit={handleSearch} className="flex gap-3 mb-6">
      <input
        type="text"
        placeholder="Search vehicle number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2.5 w-full text-sm shadow-sm focus:border-[#6a1a12] focus:ring-[#6a1a12]"
      />

      <button
        type="submit"
        className="flex items-center gap-2 bg-[#6a1a12] text-white px-5 py-2.5 rounded-lg shadow hover:bg-[#8d3a30] transition"
      >
        <Search size={18} /> Search
      </button>
    </form>

    {/* Loading State */}
    {loading && (
      <div className="text-center py-10">
        <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-[#6a1a12] rounded-full mx-auto"/>
        <p className="mt-3 text-gray-600">Loading vehicles...</p>
      </div>
    )}

    {/* Error */}
    {!loading && error && (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchVehicles}
          className="mt-3 bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )}

    {/* Table */}
    {!loading && !error && (
      <div className=" relative bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

        <div className="overflow-auto max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left">SNO</th>
                <th className="px-6 py-3 text-left">Vehicle Number</th>
                <th className="px-6 py-3 text-left">Vehicle Type</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={row.id} className=" hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-[16px]  left-0 bg-white z-10 font-medium">{index + 1}</td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">{row.number}</td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">{row.type}</td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <div className="flex gap-4 items-center">
                        <button
                          onClick={() => openEditModal(row)}
                          className="text-blue-500 cursor-pointer hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteVehicle(row.id, row.number)}
                          className="text-[#6a1a12] hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-gray-500"
                  >
                    {search ? "No matching vehicles found" : "No vehicles available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    )}

    {/* Modal */}
    <VehicleModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onSubmit={handleSubmit}
      loading={submitLoading}
      editData={editingVehicle}
    />
  </div>
);

};

export default VehicleList;