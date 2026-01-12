import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";

const Movement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log("📍 Location state:", location.state);
  console.log("📦 Vehicle Data received:", location.state?.vehicleData);

  const vehicleData = location.state?.vehicleData;

  // If no data, show error and back button
  if (!vehicleData) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 bg-[#6a1a12] text-white px-4 py-2 rounded-md hover:bg-[#955d5d] transition"
          >
            ← Back
          </button>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Vehicle Movement Details</h1>
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <p className="text-yellow-700">❌ No vehicle data found. Please go back and select a vehicle to view.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse LR details - it's a JSON string containing an array
  let lrDetails = null;
  if (vehicleData.lr_details) {
    try {
      lrDetails = JSON.parse(vehicleData.lr_details);
      console.log("✅ Parsed LR Details:", lrDetails);
    } catch (error) {
      console.log("❌ LR Details Parse Error:", error);
    }
  }

  // Calculate total cases
  const totalCases = lrDetails && Array.isArray(lrDetails) 
    ? lrDetails.reduce((total, item) => {
        const cases = parseInt(item.cases || 0);
        return total + (isNaN(cases) ? 0 : cases);
      }, 0)
    : 0;

  // 📌 EXPORT XLSX FUNCTION
  const handleExport = () => {
  if (!lrDetails || !Array.isArray(lrDetails) || lrDetails.length === 0) {
    alert("No movement details to export");
    return;
  }

  const exportData = lrDetails.map((item, index) => ({
    COMPANY:  item.company || "N/A",
    STOCKIST: item.customer || "N/A",
    INVOICE: item.invoice_no || item.invoice || "N/A",
    CASES: item.cases || "0",
    DRIVER: vehicleData.driver_name || "N/A",
    VEHICLE: vehicleData.vehicle_no || "N/A",
    DATE: vehicleData.created_date
      ? new Date(vehicleData.created_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : "N/A",
    "DELIVERY PERSON": item.delivery_person || "N/A",
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movement Details");

  const filename = `Vehicle_Movement_${vehicleData.vehicle_no || "UNKNOWN"}.xlsx`;
  XLSX.writeFile(wb, filename);
};


  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#6a1a12] text-white px-4 py-2 rounded-md hover:bg-[#955d5d] transition"
          >
            ← Back to List
          </button>

          <button 
            onClick={handleExport}
            className="bg-[#6a1a12] text-white px-4 py-2 rounded-md hover:bg-[#955d5d] transition"
          >
            Export Current
          </button>
        </div>

        {/* Header Information */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">Created date : </span>
              <span>
                {vehicleData.created_date ? 
                  new Date(vehicleData.created_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : "N/A"}
              </span>
            </div>
            <div>
              <span className="font-semibold">Vehicle no : </span>
              <span>{vehicleData.vehicle_no || "N/A"}</span>
            </div>
            <div>
              <span className="font-semibold">Driver name: </span>
              <span>{vehicleData.driver_name || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Table Header */}
          <div className="border-b">
            <div className="grid grid-cols-12 bg-gray-100 text-sm font-semibold">
              <div className="col-span-1 p-3 border-r">SNO</div>
              <div className="col-span-3 p-3 border-r">COMPANY</div>
              <div className="col-span-4 p-3 border-r">CUSTOMER</div>
              <div className="col-span-2 p-3 border-r">INVOICE</div>
              <div className="col-span-1 p-3 border-r">CASES</div>
              <div className="col-span-1 p-3">DELIVERY PERSON</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {lrDetails && Array.isArray(lrDetails) && lrDetails.length > 0 ? (
              lrDetails.map((item, index) => (
                <div key={index} className="grid grid-cols-12 text-sm hover:bg-gray-50">
                  <div className="col-span-1 p-3 border-r">{index + 1}</div>
                  <div className="col-span-3 p-3 border-r">
                    { item.company || "N/A"}
                  </div>
                  <div className="col-span-4 p-3 border-r">
                    {item.customer || "N/A"}
                  </div>
                  <div className="col-span-2 p-3 border-r">
                    {item.invoice_no || item.invoice || "N/A"}
                  </div>
                  <div className="col-span-1 p-3 border-r">
                    {item.cases || "0"}
                  </div>
                  <div className="col-span-1 p-3">
                    {item.delivery_person || "N/A"}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-12 text-sm">
                <div className="col-span-12 p-8 text-center text-gray-500">
                  No delivery details available
                </div>
              </div>
            )}
          </div>

          {/* Total Cases */}
          <div className="border-t bg-gray-50">
            <div className="grid grid-cols-12 text-sm font-semibold">
              <div className="col-span-11 p-3 text-right border-r">Total cases</div>
              <div className="col-span-1 p-3">{totalCases}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Movement;
