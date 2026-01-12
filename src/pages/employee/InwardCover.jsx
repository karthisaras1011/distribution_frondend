import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyByCustomer, getTransport } from "../../service/employee/returns";
import { insertCover } from "../../service/employee/inward";
import Swal from "sweetalert2";

const InwardCoverReport = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const companyId = auth?.company?.id || "";
  const companyName = auth?.company?.name || "";
  const userName = auth?.userName || "";

  // Customer states
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Transport states
  const [transports, setTransports] = useState([]);
  const [filteredTransports, setFilteredTransports] = useState([]);
  const [transportSearch, setTransportSearch] = useState("");
  const [showTransportDropdown, setShowTransportDropdown] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);

  // Form states
  const [courierNo, setCourierNo] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ✅ Check Entry state - single input
  const [checkEntry, setCheckEntry] = useState("");

  // ✅ Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getCompanyByCustomer(companyId);
        console.log("Customer API:", response);
        if (response?.data) {
          setCustomers(response.data);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    if (companyId) fetchCustomers();
  }, [companyId]);

  // ✅ Fetch transports
  useEffect(() => {
    const fetchTransports = async () => {
      try {
        const response = await getTransport(companyId);
        console.log("Transport API:", response);
        if (response?.data) {
          setTransports(response.data);
        }
      } catch (error) {
        console.error("Error fetching transports:", error);
      }
    };

    if (companyId) fetchTransports();
  }, [companyId]);

  // ✅ Show SweetAlert
  const showAlert = (icon, title, text, confirmButtonColor = "#3085d6") => {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor,
      confirmButtonText: "OK",
    });
  };

  // ✅ Handle customer search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCustomerCity("");
    setSelectedCustomer(null);

    if (value.trim() === "") {
      setFilteredCustomers([]);
      setShowDropdown(false);
      return;
    }

    const results = customers.filter((c) =>
      c.customer_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCustomers(results);
    setShowDropdown(true);
  };

  // ✅ Select customer
  const handleSelect = (cust) => {
    setSearchTerm(cust.customer_name);
    setCustomerCity(cust.customer_city || "");
    setSelectedCustomer(cust);
    setShowDropdown(false);
  };

  // ✅ Handle transport search
  const handleTransportSearch = (e) => {
    const value = e.target.value;
    setTransportSearch(value);
    setSelectedTransport(null);

    if (value.trim() === "") {
      setFilteredTransports([]);
      setShowTransportDropdown(false);
      return;
    }

    const results = transports.filter((t) =>
      t.transport_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransports(results);
    setShowTransportDropdown(true);
  };

  // ✅ Select transport
  const handleTransportSelect = (t) => {
    setTransportSearch(t.transport_name);
    setSelectedTransport(t);
    setShowTransportDropdown(false);
  };

  // ✅ Format check entries from comma separated string
  const formatCheckEntries = () => {
    if (!checkEntry.trim()) return null;
    
    const checkEntriesObj = {};
    const checkNumbers = checkEntry
      .split(',')
      .map(num => num.trim())
      .filter(num => num !== '');
    
    checkNumbers.forEach(num => {
      checkEntriesObj[num] = false; // Default status false
    });
    
    return checkEntriesObj;
  };

  // ✅ Reset form
  const resetForm = () => {
    setSearchTerm("");
    setCustomerCity("");
    setTransportSearch("");
    setCourierNo("");
    setCheckEntry("");
    setComments("");
    setSelectedCustomer(null);
    setSelectedTransport(null);
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer || !selectedTransport) {
      await showAlert("warning", "Missing Fields", "Please select both customer and transport", "#d33");
      return;
    }

    if (!courierNo.trim()) {
      await showAlert("warning", "Missing Field", "Please enter courier number", "#d33");
      return;
    }

    const checkEntriesData = formatCheckEntries();
    
    const formData = {
      company_id: companyId,
      company_name: companyName,
      customer_id: selectedCustomer.customer_id,
      customer_name: searchTerm,
      customer_city: customerCity,
      transport_name: transportSearch,
      courier_no: courierNo,
      check_entries: checkEntriesData, // JSON object: {"12345": false, "2345": false}
      comments: comments,
      entered_by: userName
    };

    console.log("Submitting form data:", formData);

    try {
      setLoading(true);
      
      // Show loading alert
      Swal.fire({
        title: "Inserting Cover...",
        text: "Please wait while we process your request",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await insertCover(formData);
      
      // Close loading alert
      Swal.close();

      if (response.data.success) {
        await showAlert("success", "Success!", response.data.message || "Cover inserted successfully!", "#28a745");
        resetForm();
      } else {
        await showAlert("error", "Error!", response.data.message || "Something went wrong!", "#d33");
      }
      
    } catch (error) {
      Swal.close(); // Close loading alert on error
      
      console.error("Error inserting cover:", error);
      
      // Handle different error responses
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            await showAlert("error", "Bad Request", data.message || "Missing required fields", "#d33");
            break;
          case 409:
            await showAlert("warning", "Duplicate Record", data.message || "This record already exists", "#ffc107");
            break;
          case 500:
            await showAlert("error", "Server Error", data.message || "Internal server error. Please try again later.", "#d33");
            break;
          default:
            await showAlert("error", "Error!", data.message || "Failed to insert cover. Please try again.", "#d33");
        }
      } else if (error.request) {
        await showAlert("error", "Network Error", "Please check your internet connection and try again.", "#d33");
      } else {
        await showAlert("error", "Error!", "An unexpected error occurred. Please try again.", "#d33");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!companyId) return null;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-10 mt-10">
      <h2 className="text-3xl font-semibold text-gray-400 mb-10">
        Inward Cover Report - {companyName}
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ENTRY FOR */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              ENTRY FOR
            </label>
            <input
              type="text"
              value="inward-cover"
              disabled
              className="w-full border border-gray-400 rounded-md px-4 py-2 bg-gray-200 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* COMPANY NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              COMPANY NAME
            </label>
            <input
              type="text"
              value={companyName}
              disabled
              className="w-full border rounded-md px-4 py-2 bg-gray-200 border-gray-400 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* COURIER NO */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              COURIER NO
            </label>
            <input
              type="text"
              value={courierNo}
              onChange={(e) => setCourierNo(e.target.value)}
              placeholder="Enter courier number"
              className="w-full border rounded-md px-4 py-2"
              required
            />
          </div>

          {/* ✅ TRANSPORT NAME DROPDOWN */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              TRANSPORT NAME
            </label>
            <input
              type="text"
              value={transportSearch}
              onChange={handleTransportSearch}
              onFocus={() => setShowTransportDropdown(true)}
              onBlur={() => setTimeout(() => setShowTransportDropdown(false), 200)}
              placeholder="Enter or select transport name"
              className="w-full border rounded-md px-4 py-2"
              required
            />

            {showTransportDropdown && filteredTransports.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md max-h-40 overflow-y-auto shadow-md">
                {filteredTransports.map((t, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleTransportSelect(t)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {t.transport_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ✅ CUSTOMER NAME DROPDOWN */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              CUSTOMER NAME
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Enter customer name"
              className="w-full border rounded-md px-4 py-2"
              required
            />

            {showDropdown && filteredCustomers.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md max-h-40 overflow-y-auto shadow-md">
                {filteredCustomers.map((cust, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelect(cust)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {cust.customer_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ✅ AUTO-FILLED CITY */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              CUSTOMER CITY
            </label>
            <input
              type="text"
              value={customerCity}
              placeholder="Customer city"
              className="w-full border rounded-md px-4 py-2 bg-gray-200 border-gray-400"
              readOnly
              required
            />
          </div>

          {/* ✅ CHECK ENTRY - Single Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              CHECK ENTRIES
            </label>
            <input
              type="text"
              value={checkEntry}
              onChange={(e) => setCheckEntry(e.target.value)}
              placeholder="Enter check numbers separated by commas"
              className="w-full border rounded-md px-4 py-2 border-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: 12345, 67890, 55555 (All will be stored as false initially)
            </p>
          </div>
        </div>

        {/* COMMENTS */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            COMMENTS
          </label>
          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter comments"
            className="w-full border rounded-md px-4 py-2"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#6a1a13] text-white px-6 py-2 rounded-md shadow-md hover:bg-[#865556] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Inserting..." : "Insert"}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default InwardCoverReport;