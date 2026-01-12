import React, { useState, useEffect } from "react";
import {  Eye } from "lucide-react";
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
    totalPages: null
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
      
      console.log("API Response:", response.data);
    
      if (response.data && Array.isArray(response.data.vehicles)) {
        setData(response.data.vehicles);
        
        if (response.data.pagination) {
          setApiPagination(response.data.pagination);
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

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Handle view button click - pass the specific vehicle data
  const handleView = (vehicleData) => {
    console.log("Viewing vehicle data:", vehicleData);
    navigate('/admin/vihcle', { 
      state: {   
        vehicleData: vehicleData 
      } 
    });           
  };

  const totalRecords = apiPagination.totalRecords || data.length;
  const totalPages = apiPagination.totalPages || Math.ceil(totalRecords / recordsPerPage);

  return (
    <>
      {/* Filter Card */}
      <div className="w-full p-4  rounded-md mt-2">
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
      <div className="w-full  p-6 shadow-sm rounded-md ">
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
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-hide">
              <table className="min-w-full text-sm text-gray-700 border-collapse">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">SNO</th>
                    <th className="p-3 text-left">Created Date</th>
                    <th className="p-3 text-left">Vehicle Number</th>
                    <th className="p-3 text-left">Driver</th>
                    <th className="p-3 text-center">View</th>
                  </tr>
                </thead>

                <tbody className="h-80">
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={index} className=" hover:bg-gray-50 transition  cursor-pointer">
                        <td className="border border-gray-200 px-4 py-3 text-[16px]  left-0 bg-white z-10 font-medium">{((currentPage - 1) * recordsPerPage) + index + 1}</td>
                        <td className="px-4 py-2 border border-gray-200 text-[16px]">{formatDate(item.created_date)}</td>
                        <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.vehicle_no || "N/A"}</td>
                        <td className="px-4 py-2 border border-gray-200 text-[16px]">{item.driver_name || "N/A"}</td>
                        <td className="px-4 py-2 border border-gray-200 text-[16px] text-center">
                          <button 
                            className=" text-[#6a1a12] hover:bg-[#955d5d]"
                            onClick={() => handleView(item)} // Pass the specific item data
                          >
                            <Eye size={28} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
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