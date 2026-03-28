import React, { useState, useEffect } from "react";
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../components/pagination/pagenation";
import { getVehicleMovement } from "../../service/admin/vehicleMovement";
import { useNavigate } from "react-router-dom";

const VehicleMovement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: ""
  });
  const [apiPagination, setApiPagination] = useState({
    currentPage: 1,
    limit: 50,
    totalPages: null,
    totalRecords: 0
  });
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "picked_date", // Default sort by date
    direction: "desc" // Default descending (latest first)
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicleMovement(1);
  }, []);

  const fetchVehicleMovement = async (page = currentPage) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: page,
        limit: recordsPerPage,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      console.log("API Params:", params);

      const response = await getVehicleMovement(params);
      
      console.log("API Responseeeeeee:", response.data);
    
      if (response.data && Array.isArray(response.data.vehicles)) {
        setData(response.data.vehicles);
        
        if (response.data.pagination) {
          setApiPagination({
            currentPage: response.data.pagination.currentPage || page,
            totalPages: response.data.pagination.totalPages || 1,
            totalRecords: response.data.pagination.totalRecords || response.data.vehicles.length,
            limit: response.data.pagination.limit || recordsPerPage
          });
          setCurrentPage(response.data.pagination.currentPage || page);
        }
      } else {
        setData([]);
        console.warn("Unexpected API response structure");
      }
    } catch (err) {
      setError("Failed to fetch vehicle movement data");
      console.error("Error fetching vehicle movement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setRecordsPerPage(value);
    setCurrentPage(1);
    fetchVehicleMovement(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchVehicleMovement(page);
  };

  const handleGetReport = () => {
    setCurrentPage(1);
    fetchVehicleMovement(1);
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon for header
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 inline-block" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 inline-block" /> 
      : <ArrowDown size={14} className="ml-1 inline-block" />;
  };

  // Helper function to get value for sorting
  const getValueForSorting = (trip, key) => {
    switch(key) {
      case 'trip_id':
        return trip.trip_id || '';
      case 'trip_count':
        return trip.trip_count || 0;
      case 'picked_date':
        return trip.picked_date || '';
      case 'vehicle_no':
        return trip.vehicle_no || '';
      case 'driver_name':
        return trip.driver_name || '';
      case 'distance':
        return parseFloat(trip.distance) || 0;
      default:
        return '';
    }
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

  // Format date and time
 

  // Format distance to 2 decimal places
  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return "-";
    
    // Convert to number if it's a string
    const numDistance = Number(distance);
    
    // Check if it's a valid number
    if (isNaN(numDistance)) return "-";
    
    // Format to 2 decimal places
    return numDistance.toFixed(2);
  };

  // Group vehicles by trip_id and collect all related records
  const groupVehiclesByTrip = () => {
    const groupedMap = new Map();
    
    data.forEach(vehicle => {
      const tripId = vehicle.trip_id;
      if (!groupedMap.has(tripId)) {
        groupedMap.set(tripId, {
          trip_id: vehicle.trip_id,
          trip_count: vehicle.trip_count,
          picked_date: vehicle.picked_date,
          vehicle_no: vehicle.vehicle_no,
          driver_name: vehicle.driver_name,
          driver_mobile: vehicle.driver_mobile,
          driver_name_lr: vehicle.driver_name_lr,
          delivery_person_names: vehicle.delivery_person_names,
          trip_delivery_persons: vehicle.trip_delivery_persons,
          trip_st_time: vehicle.trip_st_time,
          trip_end_time: vehicle.trip_end_time,
          trip_status: vehicle.trip_status,
          route_name: vehicle.route_name,
          distance: vehicle.distance,
          records: []
        });
      }
      
      // Add this record to the trip's records array
      groupedMap.get(tripId).records.push({
        sales_id: vehicle.sales_id,
        company_name: vehicle.company_name,
        customer_name: vehicle.customer_name,
        customer_id: vehicle.customer_id,
        company_id: vehicle.company_id,
        invoice_no: vehicle.invoice_no,
        invoice_date: vehicle.invoice_date,
        no_of_boxes: vehicle.no_of_boxes,
        clubed_box_no: vehicle.clubed_box_no,
        reference_no: vehicle.reference_no,
        clubbed_from: vehicle.clubbed_from,
        out_time: vehicle.out_time,
        Conduit: vehicle.Conduit,
        Cables: vehicle.Cables,
        Others: vehicle.Others,
        Stabilizer: vehicle.Stabilizer,
        Water_heater: vehicle.Water_heater,
        routing_id: vehicle.routing_id,
        route_name: vehicle.route_name,
        routing_days: vehicle.routing_days
      });
    });
    
    // Convert Map to Array
    return Array.from(groupedMap.values());
  };

  // Apply sorting to grouped data
  const getSortedGroupedData = () => {
    const grouped = groupVehiclesByTrip();
    
    if (!sortConfig.key) return grouped;
    
    return [...grouped].sort((a, b) => {
      let aValue = getValueForSorting(a, sortConfig.key);
      let bValue = getValueForSorting(b, sortConfig.key);

      // Handle undefined or null values
      if (aValue === undefined || aValue === null) aValue = sortConfig.key === 'trip_count' || sortConfig.key === 'distance' ? 0 : '';
      if (bValue === undefined || bValue === null) bValue = sortConfig.key === 'trip_count' || sortConfig.key === 'distance' ? 0 : '';

      // Compare values
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Handle view button click - pass all records with same trip_id
  const handleView = (tripGroup) => {
    console.log("Viewing trip group:", tripGroup);
    navigate('/admin/vihcle', { 
      state: {   
        tripData: tripGroup,
        vehicleData: tripGroup.records[0] // Keep for backward compatibility
      } 
    });           
  };

  const groupedData = getSortedGroupedData();
  const totalRecords = apiPagination.totalRecords || data.length;
  const totalPages = apiPagination.totalPages || Math.ceil(totalRecords / recordsPerPage);

  return (
    <>
      {/* Filter Card */}
      <div className="w-full p-4 rounded-md mt-2">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Vehicle movement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Start Date */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-600">START DATE</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-80 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-600">END DATE</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-80 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Records Per Page */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-600">RECORDS PER/PAGE</label>
            <select
              className="w-80 border border-gray-300 rounded-md px-3 py-2"
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>

          {/* Get Report Button - 4th Column */}
          <div className="flex items-end">
            <button
              onClick={handleGetReport}
              disabled={loading}
              className="bg-[#6a1a12] text-white px-6 py-2 rounded-md hover:bg-[#955d5d] transition disabled:bg-[#955d5d]"
            >
              {loading ? "Loading..." : "Get Report"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Separate Table Card */}
      <div className="w-full p-6 shadow-sm rounded-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Vehicle Movement Report
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vehicle movement data...</p>
          </div>
        ) : (
          <>
            <div className="relative rounded-xl shadow-sm border border-gray-200 mt-4">
              <div className="overflow-x-auto overflow-y-auto max-h-[600px] ">
                <table className="min-w-full text-sm text-gray-700 border-collapse">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
                    <tr>
                      <th className="p-3 text-left">SNO</th>
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('trip_id')}
                      >
                        <div className="flex items-center">
                          Trip ID {getSortIcon('trip_id')}
                        </div>
                      </th>
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('trip_count')}
                      >
                        <div className="flex items-center">
                          Trip Count {getSortIcon('trip_count')}
                        </div>
                      </th>
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('picked_date')}
                      >
                        <div className="flex items-center">
                          Created Date {getSortIcon('picked_date')}
                        </div>
                      </th>
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('vehicle_no')}
                      >
                        <div className="flex items-center">
                          Vehicle Number {getSortIcon('vehicle_no')}
                        </div>
                      </th>
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('driver_name')}
                      >
                        <div className="flex items-center">
                          Driver {getSortIcon('driver_name')}
                        </div>
                      </th>
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200"
                        onClick={() => requestSort('distance')}
                      >
                        <div className="flex items-center">
                          Distance (km) {getSortIcon('distance')}
                        </div>
                      </th>
                      <th className="p-3 text-center">View</th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupedData.length > 0 ? (
                      groupedData.map((trip, index) => (
                        <tr key={`${trip.trip_id}-${index}`} className="hover:bg-gray-50 transition cursor-pointer">
                          <td className="border border-gray-200 px-4 py-3 text-[16px] font-medium">
                            {((currentPage - 1) * recordsPerPage) + index + 1}
                          </td>
                          <td className="px-4 py-2 border border-gray-200 text-[16px]">
                            {trip.trip_id || "-"}                                          
                          </td>
                          <td className="px-4 py-2 border border-gray-200 text-[16px]">
                            {trip.trip_count || "-"}
                          </td>
                          <td className="px-4 py-2 border border-gray-200 text-[16px]">
                            {formatDate(trip.picked_date)}
                          </td>
                          <td className="px-4 py-2 border border-gray-200 text-[16px]">
                            {trip.vehicle_no || "-"}
                          </td>
                          <td className="px-4 py-2 border border-gray-200 text-[16px]">
                            {trip.driver_name || "-"}
                          </td>
                          <td className="px-4 py-2 border border-gray-200 text-[16px]">
                            {formatDistance(trip.distance)}
                          </td>
                          <td className="px-4 py-2 border border-gray-200 text-[16px] text-center">
                            <button 
                              className="text-[#6a1a12] hover:text-[#955d5d]"
                              onClick={() => handleView(trip)}
                            >
                              <Eye size={28} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-500">
                          No vehicle movement records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalRecords > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRecords={totalRecords}
                  recordsPerPage={recordsPerPage}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  showFirstLast={true}
                  showPrevNext={true}
                  showPageNumbers={true}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default VehicleMovement;