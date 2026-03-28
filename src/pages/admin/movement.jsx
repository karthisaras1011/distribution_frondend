import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";

const Movement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log("📍 Location state:", location.state);
  console.log("📦 Trip Data received:", location.state?.tripData);

  const tripData = location.state?.tripData;
  const vehicleData = location.state?.vehicleData; // For backward compatibility

  // If no data, show error and back button
  if (!tripData && !vehicleData) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
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

  // Use tripData if available, otherwise fallback to vehicleData
  const activeTrip = tripData || {
    trip_id: vehicleData?.trip_id,
    trip_count: vehicleData?.trip_count,
    vehicle_no: vehicleData?.vehicle_no,
    driver_name: vehicleData?.driver_name,
    driver_mobile: vehicleData?.driver_mobile,
    driver_name_lr: vehicleData?.driver_name_lr,
    delivery_person_names: vehicleData?.delivery_person_names,
    trip_delivery_persons: vehicleData?.trip_delivery_persons,
    trip_st_time: vehicleData?.trip_st_time,
    trip_end_time: vehicleData?.trip_end_time,
    trip_status: vehicleData?.trip_status,
    picked_date: vehicleData?.picked_date,
    records: vehicleData ? [vehicleData] : []
  };

  // Parse clubbed_from if it exists
  const parseClubbedFrom = (clubbedFrom) => {
    if (!clubbedFrom) return [];
    try {
      return JSON.parse(clubbedFrom);
    } catch {
      return [];
    }
  };

  // Get unique records by reference number
  const getUniqueRecordsByReference = () => {
    if (!activeTrip.records || activeTrip.records.length === 0) {
      return [];
    }

    const uniqueMap = new Map();
    
    activeTrip.records.forEach(record => {
      const referenceNo = record.reference_no;
      
      // If reference_no exists, use it as key for uniqueness
      if (referenceNo && referenceNo !== "null" && referenceNo !== "undefined" && referenceNo.trim() !== "") {
        // Only keep the first occurrence of each reference number
        if (!uniqueMap.has(referenceNo)) {
          uniqueMap.set(referenceNo, {
            ...record,
            duplicate_count: 1,
            all_invoices: [record.invoice_no], // Store all invoices for this reference
            cases_value: parseInt(record.no_of_boxes || record.clubed_box_no || 0) || 0 // Store cases for unique count
          });
        } else {
          // Increment duplicate count and add invoice to list
          const existing = uniqueMap.get(referenceNo);
          existing.duplicate_count += 1;
          existing.all_invoices.push(record.invoice_no);
          // Don't add cases for duplicates
        }
      } else {
        // For records without reference, keep them as is with a unique key
        const uniqueKey = `no-ref-${record.invoice_no || record.sales_id || Math.random()}`;
        uniqueMap.set(uniqueKey, {
          ...record,
          duplicate_count: 1,
          all_invoices: [record.invoice_no],
          cases_value: parseInt(record.no_of_boxes || record.clubed_box_no || 0) || 0
        });
      }
    });
    
    // Convert Map to Array
    return Array.from(uniqueMap.values());
  };

  const uniqueRecords = getUniqueRecordsByReference();

  // Calculate total cases from unique records only
  const totalUniqueCases = uniqueRecords.reduce((total, record) => {
    const cases = parseInt(record.no_of_boxes || record.clubed_box_no || 0);
    return total + (isNaN(cases) ? 0 : cases);
  }, 0);

  // Format date function to match the image format (3/6/2026, 10:17:09 AM)
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not Started";
    
    const date = new Date(dateString);
    
    // Get components
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-indexed
    const year = date.getFullYear();
    
    // Get time in 12-hour format
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    // Format minutes and seconds with leading zeros
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    
    return `${day}/${month}/${year}, ${hours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  };

  // Format date only (for picked date)
  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Format end time based on trip status
  const formatEndTime = (endTimeString, tripStatus) => {
    if (!endTimeString) {
      // If trip status is "Started", show "Not Ended", otherwise show "Not Started"
      return tripStatus === "Started" ? "Not Ended" : "Not Started";
    }
    return formatDateTime(endTimeString);
  };

  // 📌 PRINT FUNCTION
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print');
      return;
    }

    const styles = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #6a1a12;
          padding-bottom: 15px;
        }
        .print-header h1 {
          color: #6a1a12;
          margin: 0;
          font-size: 24px;
        }
        .print-header h2 {
          margin: 5px 0;
          font-size: 18px;
          color: #555;
        }
        .print-header .date {
          color: #777;
          font-size: 14px;
        }
        .trip-details {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 25px;
          border: 1px solid #ddd;
        }
        .trip-details-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .detail-item {
          margin: 5px 0;
        }
        .detail-label {
          font-weight: bold;
          color: #6a1a12;
          font-size: 12px;
          text-transform: uppercase;
        }
        .detail-value {
          font-size: 16px;
          margin-top: 3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        th {
          background: #6a1a12;
          color: white;
          padding: 10px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
        }
        td {
          padding: 8px 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        .duplicate-row {
          background: #fff3cd;
        }
        .duplicate-badge {
          background: #ffc107;
          color: #000;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
          margin-left: 5px;
        }
        .total-row {
          background: #f0f0f0;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: right;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        .summary-section {
          margin-top: 25px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 5px;
        }
        .summary-title {
          font-weight: bold;
          color: #6a1a12;
          margin-bottom: 10px;
        }
        .duplicate-summary {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .duplicate-item {
          background: white;
          padding: 10px;
          border: 1px solid #ffc107;
          border-radius: 4px;
        }
        @media print {
          .no-print {
            display: none;
          }
          body {
            margin: 0;
            padding: 15px;
          }
        }
      </style>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vehicle Movement Report - ${activeTrip.vehicle_no || 'Unknown'}</title>
          ${styles}
        </head>
        <body>
          <div class="print-header">
            <h1>VEHICLE MOVEMENT REPORT</h1>
            <h2>Trip ID: ${activeTrip.trip_id || 'N/A'} | Vehicle: ${activeTrip.vehicle_no || 'N/A'}</h2>
            <div class="date">Generated on: ${formatDateTime(new Date().toISOString())}</div>
          </div>

          <div class="trip-details">
            <div class="trip-details-grid">
              <div class="detail-item">
                <div class="detail-label">Picked Date</div>
                <div class="detail-value">${formatDateOnly(activeTrip.picked_date)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Vehicle Number</div>
                <div class="detail-value">${activeTrip.vehicle_no || 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Driver Name</div>
                <div class="detail-value">${activeTrip.driver_name || activeTrip.driver_name_lr || 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Driver Mobile</div>
                <div class="detail-value">${activeTrip.driver_mobile || 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Delivery Persons</div>
                <div class="detail-value">${activeTrip.delivery_person_names || 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Trip Status</div>
                <div class="detail-value">${activeTrip.trip_status || 'N/A'}</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>SNO</th>
                <th>Company</th>
                <th>Customer</th>
                <th>Invoice No</th>
                <th>Reference No</th>
                <th>Cases</th>
                <th>Clubbed From</th>
              </tr>
            </thead>
            <tbody>
              ${uniqueRecords.map((record, index) => {
                const clubbedFrom = parseClubbedFrom(record.clubbed_from);
                const hasDuplicates = record.duplicate_count > 1;
                
                return `
                  <tr class="${hasDuplicates ? 'duplicate-row' : ''}">
                    <td>
                      ${index + 1}
                      ${hasDuplicates ? `<span class="duplicate-badge">${record.duplicate_count}</span>` : ''}
                    </td>
                    <td>${record.company_name || '-'}</td>
                    <td>${record.customer_name || '-'}</td>
                    <td>
                      ${record.invoice_no || '-'}
                      ${hasDuplicates && record.all_invoices.length > 1 ? 
                        `<br><small>+${record.duplicate_count - 1} more: ${record.all_invoices.slice(1).join(', ')}</small>` 
                        : ''}
                    </td>
                    <td>${record.reference_no || '-'}</td>
                    <td>${record.no_of_boxes || record.clubed_box_no || '0'}</td>
                    <td>${clubbedFrom.length > 0 ? clubbedFrom.join(', ') : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="5" style="text-align: right;">Total Cases:</td>
                <td>${totalUniqueCases}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <div>Trip Start: ${formatDateTime(activeTrip.trip_st_time)}</div>
            <div>Trip End: ${formatEndTime(activeTrip.trip_end_time, activeTrip.trip_status)}</div>
            <div>Status: ${activeTrip.trip_status || 'N/A'}</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Print after content is loaded
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  // 📌 EXPORT XLSX FUNCTION
  const handleExport = () => {
    if (!activeTrip.records || activeTrip.records.length === 0) {
      alert("No movement details to export");
      return;
    }

    const exportData = [];

    // Add unique records to export
    uniqueRecords.forEach((record, index) => {
      const clubbedFrom = parseClubbedFrom(record.clubbed_from);
      
      // If there are clubbed invoices, create separate rows for each
      if (clubbedFrom.length > 0) {
        clubbedFrom.forEach((clubbedInvoice, idx) => {
          exportData.push({
            SNO: `${index + 1}.${idx + 1}`,
            COMPANY: record.company_name || "N/A",
            CUSTOMER: record.customer_name || "N/A",
            "MAIN INVOICE": record.invoice_no || "N/A",
            "CLUBBED INVOICE": clubbedInvoice,
            REFERENCE: record.reference_no || "N/A",
            CASES: record.no_of_boxes || record.clubed_box_no || "0",
            "DUPLICATE COUNT": record.duplicate_count > 1 ? `${record.duplicate_count} records` : "",
            "ALL INVOICES": record.duplicate_count > 1 ? record.all_invoices.join(", ") : "",
            DRIVER: activeTrip.driver_name || activeTrip.driver_name_lr || "N/A",
            VEHICLE: activeTrip.vehicle_no || "N/A",
            DATE: formatDateOnly(activeTrip.picked_date),
            "DELIVERY PERSON": record.delivery_person_names || activeTrip.delivery_person_names || "N/A"
          });
        });
      } else {
        // Single invoice
        exportData.push({
          SNO: index + 1,
          COMPANY: record.company_name || "N/A",
          CUSTOMER: record.customer_name || "N/A",
          "MAIN INVOICE": record.invoice_no || "N/A",
          "CLUBBED INVOICE": "N/A",
          REFERENCE: record.reference_no || "N/A",
          CASES: record.no_of_boxes || record.clubed_box_no || "0",
          "DUPLICATE COUNT": record.duplicate_count > 1 ? `${record.duplicate_count} records` : "",
          "ALL INVOICES": record.duplicate_count > 1 ? record.all_invoices.join(", ") : "",
          DRIVER: activeTrip.driver_name || activeTrip.driver_name_lr || "N/A",
          VEHICLE: activeTrip.vehicle_no || "N/A",
          DATE: formatDateOnly(activeTrip.picked_date),
          "DELIVERY PERSON": record.delivery_person_names || activeTrip.delivery_person_names || "N/A"
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movement Details");

    const filename = `Vehicle_Movement_${activeTrip.vehicle_no || "UNKNOWN"}_Trip_${activeTrip.trip_id || "ID"}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back Button and Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#6a1a12] text-white px-4 py-2 rounded-md hover:bg-[#955d5d] transition flex items-center gap-2"
          >
            ← Back to List
          </button>

          <div className="flex gap-3">
            {/* Print Button */}
            <button 
              onClick={handlePrint}
              className="bg-[#6a1a12] text-white px-4 py-2 rounded-md hover:bg-[#955d5d] transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>

            {/* Export Button */}
            <button 
              onClick={handleExport}
              className="bg-[#6a1a12] text-white px-4 py-2 rounded-md hover:bg-[#955d5d] transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        {/* Header Information - Trip Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Trip Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <span className="font-semibold block text-gray-600">Picked Date</span>
              <span className="text-lg">
                {formatDateOnly(activeTrip.picked_date)}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="font-semibold block text-gray-600">Vehicle Number</span>
              <span className="text-lg">{activeTrip.vehicle_no || "N/A"}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="font-semibold block text-gray-600">Driver Name</span>
              <span className="text-lg">{activeTrip.driver_name || activeTrip.driver_name_lr || "N/A"}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="font-semibold block text-gray-600">Driver Mobile</span>
              <span className="text-lg">{activeTrip.driver_mobile || "N/A"}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="font-semibold block text-gray-600">Delivery Persons</span>
              <span className="text-lg">{activeTrip.delivery_person_names || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Delivery Details</h3>
          </div>

          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 text-left border-r">SNO</th>
                  <th className="p-3 text-left border-r">COMPANY</th>
                  <th className="p-3 text-left border-r">CUSTOMER</th>
                  <th className="p-3 text-left border-r">INVOICE NO</th>
                  <th className="p-3 text-left border-r">REFERENCE NO</th>
                  <th className="p-3 text-left border-r">CASES</th>
                  <th className="p-3 text-left border-r">CLUBBED FROM</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {uniqueRecords.length > 0 ? (
                  uniqueRecords.map((record, index) => {
                    const clubbedFrom = parseClubbedFrom(record.clubbed_from);
                    const hasDuplicates = record.duplicate_count > 1;
                    
                    return (
                      <tr key={`unique-${index}`} 
                          className={`hover:bg-gray-50 ${hasDuplicates ? 'bg-yellow-50/30' : ''}`}>
                        <td className="p-3 border-r font-medium">
                          {index + 1}
                        </td>
                        <td className="p-3 border-r">{record.company_name || "-"}</td>
                        <td className="p-3 border-r">{record.customer_name || "-"}</td>
                        <td className="p-3 border-r">
                          {record.invoice_no || "-"}
                        </td>
                        <td className="p-3 border-r">
                          {record.reference_no ? (
                            <span className={hasDuplicates ? 'font-semibold' : ''}>
                              {record.reference_no}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="p-3 border-r font-medium">
                          {record.no_of_boxes || record.clubed_box_no || "0"}
                        </td>
                        <td className="p-3 border-r">
                          {clubbedFrom.length > 0 ? (
                            <div className="text-sm">
                              {clubbedFrom.map((inv, idx) => (
                                <div key={idx} className="text-gray-600">{inv}</div>
                              ))}
                            </div>
                          ) : "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No delivery details available
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Total Row */}
              {activeTrip.records.length > 0 && (
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td colSpan="5" className="p-3 text-right border-r">Total Cases:</td>
                    <td className="p-3 border-r">{totalUniqueCases}</td>
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Trip Status */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Trip Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-600">Start Time:</span>
              <span className="ml-2 font-medium">
                {formatDateTime(activeTrip.trip_st_time)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">End Time:</span>
              <span className="ml-2 font-medium">
                {formatEndTime(activeTrip.trip_end_time, activeTrip.trip_status)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${
                activeTrip.trip_status === "Started" ? "text-green-600" : 
                activeTrip.trip_status === "Assigned" ? "text-blue-600" : 
                "text-orange-600"
              }`}>
                {activeTrip.trip_status || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movement;