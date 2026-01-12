import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import {
  updateReturn,
  getCompanyByCustomer,
  getBoxNo,
  getTransport,
} from "../../service/employee/returns";

const Returns = () => {
  const [formData, setFormData] = useState({
    courierNo: "",
    transportName: "",
    customerName: "",
    lrDate: "",
    noOfBoxes: "",
    customerCity: "",
    boxNo: "",
    boxStatus: "Checked",
    returnType: "Salable",
  });

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [transports, setTransports] = useState([]);
  const [filteredTransports, setFilteredTransports] = useState([]);
  const [transportSearch, setTransportSearch] = useState("");
  const [showTransportDropdown, setShowTransportDropdown] = useState(false);

  const { auth } = useAuth();
  const companyId = auth?.company?.id || "";
  const companyName = auth?.company?.name || "";
  const userName = auth?.userName || "";

  // Refs for closing dropdowns when clicking outside
  const transportRef = useRef(null);
  const customerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        transportRef.current &&
        !transportRef.current.contains(event.target)
      ) {
        setShowTransportDropdown(false);
      }
      if (customerRef.current && !customerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!companyId) return;
      try {
        setLoading(true);
        const response = await getCompanyByCustomer(companyId);
        setCustomers(response.data || response);
        setFilteredCustomers(response.data || response);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to load customers!",
          icon: "error",
          confirmButtonColor: "#e11d48",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [companyId]);

  // Fetch box number
  useEffect(() => {
    const fetchBoxNo = async () => {
      if (!companyId) return;
      try {
        const response = await getBoxNo(companyId);
        setFormData((prev) => ({
          ...prev,
          boxNo: response.data?.box_no || "",
        }));
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to get Box Number!",
          icon: "error",
          confirmButtonColor: "#e11d48",
        });
      }
    };
    fetchBoxNo();
  }, [companyId]);

  // Fetch transport list
  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const response = await getTransport();
        setTransports(response.data || response);
        setFilteredTransports(response.data || response);
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Failed to load transport names!",
          icon: "error",
          confirmButtonColor: "#e11d48",
        });
      }
    };
    fetchTransport();
  }, []);

  // Search filter (Transport)
  const handleTransportSearchChange = (e) => {
    const value = e.target.value;
    setTransportSearch(value);
    setShowTransportDropdown(true);
    const filtered = transports.filter((t) =>
      t.transport_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransports(filtered);
  };

  const handleTransportSelect = (transport) => {
    setFormData((prev) => ({ ...prev, transportName: transport.transport_name }));
    setTransportSearch(transport.transport_name);
    setShowTransportDropdown(false);
  };

  // Search filter (Customer)
  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        (c) =>
          c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.customer_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const handleCustomerSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleCustomerSelect = (customer) => {
    setFormData({
      ...formData,
      customerName: customer.customer_name,
      customerCity: customer.customer_city,
      customerId: customer.customer_id,
    });
    setSearchTerm(customer.customer_name);
    setShowDropdown(false);
  };

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Update function
  const handleUpdate = async () => {  
    try {

       // Convert returnType and boxStatus to numeric values
    const returnTypeValue = formData.returnType === "Salable" ? 1 : 0;
    const boxStatusValue = formData.boxStatus === "Checked" ? 1 : 0;


      const payload = { ...formData, companyName, companyId, userName,returnType:returnTypeValue,boxStatus:boxStatusValue };
      const response = await updateReturn(payload);

      await Swal.fire({ 
        title: "Success!",
        text: "Return data updated successfully!",
        icon: "success",
        confirmButtonColor: "#e11d48",
      });
       setFormData({
      courierNo: '',
      transportName: '',
      customerName: '',
      lrDate: '',
      noOfBoxes: '',
      customerCity: '',
      boxNo: '',  // will be replaced by new one below
      boxStatus: 'Checked',
      returnType: 'Salable',
    });

    setSearchTerm('');
    setTransportSearch('');
    setShowDropdown(false);
    setShowTransportDropdown(false);

      const newBox = await getBoxNo(companyId);
      setFormData((prev) => ({ ...prev, boxNo: newBox.data?.box_no || "" }));
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update return data!",
        icon: "error",
        confirmButtonColor: "#e11d48",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-semibold text-gray-400 mb-6 border-b pb-2">
        RETURNS REPORT
      </h2>

 
      {/* Input Fields */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-gray-600 text-sm mb-1">Company Name</label>
          <input
            type="text"
            value={companyName}
            disabled
            className="w-full border border-gray-400 rounded px-3 py-2 bg-gray-200"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">Courier No</label>
          <input
            type="text"
            name="courierNo"
            value={formData.courierNo}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter courier number"
          />
        </div>

        {/* Transport dropdown */}
        <div className="relative" ref={transportRef}>
          <label className="block text-gray-600 text-sm mb-1">
            Transport Name
          </label>
          <input
            type="text"
            value={transportSearch}
            onChange={handleTransportSearchChange}
            onFocus={() => setShowTransportDropdown(true)}
            className="w-full border rounded px-3 py-2"
            placeholder="Search transport name..."
          />
          {showTransportDropdown && filteredTransports.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto">
              {filteredTransports.map((t, i) => (
                <div
                  key={i}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleTransportSelect(t)}
                >
                  {t.transport_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Section */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="relative" ref={customerRef}>
          <label className="block text-gray-600 text-sm mb-1">Customer Name</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleCustomerSearchChange}
            onFocus={() => setShowDropdown(true)}
            className="w-full border rounded px-3 py-2"
            placeholder="Search customer name..."
          />
          {showDropdown && filteredCustomers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <div
                  key={c.customer_id}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleCustomerSelect(c)}
                >
                  {c.customer_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">LR Date</label>
          <input
            type="date"
            name="lrDate"
            value={formData.lrDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">Customer City</label>
          <input
            type="text"
            name="customerCity"
            value={formData.customerCity}
            readOnly
            className="w-full border border-gray-400 rounded px-3 py-2 bg-gray-200"
          />
        </div>
      </div>

      {/* Box Details */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-gray-600 text-sm mb-1">No of Boxes</label>
          <input
            type="number"
            name="noOfBoxes"
            value={formData.noOfBoxes}
            onChange={handleChange}
            min="1"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter number of boxes"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">Box No</label>
          <input
            type="text"
            name="boxNo"
            value={formData.boxNo}
            readOnly
            className="w-full border border-gray-400 rounded px-3 py-2 bg-gray-200 font-semibold text-gray-700"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">Box Status</label>
          <div className="flex items-center gap-4 mt-1">
            {["Checked", "Not checked"].map((status) => (
              <label key={status} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="boxStatus"
                  value={status}
                  checked={formData.boxStatus === status}
                  onChange={handleChange}
                  className="accent-[#6a1a13]"
                />
                {status}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Return Type */}
      <div className="mb-6">
        <label className="block text-gray-600 text-sm mb-1">Return Type</label>
        <div className="flex items-center gap-4 mt-1">
          {["Salable", "Expired"].map((type) => (
            <label key={type} className="flex items-center gap-1">
              <input
                type="radio"
                name="returnType"
                value={type}
                checked={formData.returnType === type}
                onChange={handleChange}
                className="accent-[#6a1a13]"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Update Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpdate}
          className="bg-[#6a1a13] text-white px-8 py-2 rounded-lg hover:bg-[#865556] transition duration-200"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default Returns;
