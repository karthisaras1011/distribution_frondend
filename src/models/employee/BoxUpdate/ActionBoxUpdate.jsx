import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import { updateBox, insertCredit } from "../../../service/employee/boxUpdate";

const ActionBoxUpdate = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState("boxDetails");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    boxStatus: "",
    checkedVerified: "",
    claimDate: "",
    bookingDate: "",
    registerDate: "",
    controlNo: "",
    registerNo: "",
    claimNo: "",
  });

  // Separate state for credit input fields that should clear after insert
  const [creditInputs, setCreditInputs] = useState({
    mraNo: "",
    creditNo: "",
    mraDate: "",
    creditDate: "",
  });

  // State to store existing credit details
  const [existingCredits, setExistingCredits] = useState([]);

  useEffect(() => {
    if (item) {
      console.log("Credit Data Received:", item);
      
      // Convert backend box_status (1/0) to frontend values ("CHEKED"/"NOT_CHEKED")
      const backendBoxStatus = item.box_status || item.box_checked;
      let frontendBoxStatus = "";
      
      if (backendBoxStatus === 1 || backendBoxStatus === "1") {
        frontendBoxStatus = "CHEKED";
      } else if (backendBoxStatus === 0 || backendBoxStatus === "0") {
        frontendBoxStatus = "NOT_CHEKED";
      }

      setFormData({
        boxStatus: frontendBoxStatus,
        checkedVerified: item.checked_verified || item.checked_by || "",
        claimDate: item.claim_date || "",
        bookingDate: item.booking_date || "",
        registerDate: item.register_date || "",
        controlNo: item.control_no || "",
        registerNo: item.register_no || "",
        claimNo: item.claim_no || "",
      });

      // Parse and store existing credit details
      let credits = [];
      try {
        if (item.credit_details) {
          if (typeof item.credit_details === "string") {
            credits = JSON.parse(item.credit_details);
          } else if (Array.isArray(item.credit_details)) {
            credits = item.credit_details;
          }
        }
      } catch (error) {
        console.error("Error parsing credit details:", error);
        credits = [];
      }

      const isValid = (val) =>
        val !== null &&
        val !== undefined &&
        val !== "" &&
        val !== "-";

      const filteredCredits = credits.filter(
        (credit) =>
          isValid(credit.mra_no) ||
          isValid(credit.mra_date) ||
          isValid(credit.credit_no) ||
          isValid(credit.credit_date)
      );

      setExistingCredits(filteredCredits);
    }
  }, [item]);

  // Convert mixed date formats to YYYY-MM-DD for HTML input
  const formatDateForInput = (date) => {
    if (!date) return "";
    
    // Handle DD-MM-YYYY format
    if (typeof date === 'string' && date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        // Check if it's DD-MM-YYYY (first part is day)
        if (parts[0].length === 2 && parseInt(parts[0]) > 0 && parseInt(parts[0]) <= 31) {
          const [dd, mm, yyyy] = parts;
          return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }
        // Check if it's YYYY-MM-DD (first part is year)
        else if (parts[0].length === 4) {
          const [yyyy, mm, dd] = parts;
          return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }
      }
    }
    
    // If it's already in proper format or Date object
    const d = new Date(date);
    return !isNaN(d) ? d.toISOString().split("T")[0] : "";
  };

  // Convert to YYYY-MM-DD for backend
  const formatDateForBackend = (date) => {
    if (!date) return "";
    
    const d = new Date(date);
    if (isNaN(d)) return "";
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`; // YYYY-MM-DD format for backend
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if this is a credit input field
    if (['mraNo', 'creditNo', 'mraDate', 'creditDate'].includes(name)) {
      setCreditInputs((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Convert frontend boxStatus to backend values (1/0)
  const getBackendBoxStatus = (frontendStatus) => {
    if (frontendStatus === "CHEKED") return 1;
    if (frontendStatus === "NOT_CHEKED") return 0;
    return "";
  };

  // Function to handle credit data insertion
  const handleCreditInsert = async (returnId) => {
    try {
      // Check if we have any credit data to insert
      const hasMraData = creditInputs.mraNo || creditInputs.mraDate;
      const hasCreditData = creditInputs.creditNo || creditInputs.creditDate;

      if (!hasMraData && !hasCreditData) {
        console.log("No credit data to insert");
        return null;
      }

      // Prepare credit data from creditInputs
      const creditData = {
        returns_id: returnId,
        mra_no: creditInputs.mraNo || "",
        mra_date: formatDateForBackend(creditInputs.mraDate),
        credit_no: creditInputs.creditNo || "",
        credit_date: formatDateForBackend(creditInputs.creditDate)
      };

      console.log("📤 Inserting credit data:", creditData);

      const res = await insertCredit(creditData);

      if (res?.data?.success) {
        console.log("✅ Credit data inserted successfully:", res.data);
        
        // Create new credit object for UI update
        const newCredit = {
          mra_no: creditInputs.mraNo || "",
          mra_date: formatDateForBackend(creditInputs.mraDate),
          credit_no: creditInputs.creditNo || "",
          credit_date: formatDateForBackend(creditInputs.creditDate),
        };

        return newCredit;
      } else {
        console.warn("⚠️ Credit insertion response:", res?.data);
        throw new Error(res?.data?.message || "Credit insertion failed");
      }
    } catch (error) {
      console.error("❌ Error inserting credit data:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this box details?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#9ca3af",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);

      // Format all dates for returns table update
      const updateData = {
        return_id: item.return_id,
        box_status: getBackendBoxStatus(formData.boxStatus),
        checked_verified: formData.checkedVerified,
        claim_date: formatDateForBackend(formData.claimDate),
        booking_date: formatDateForBackend(formData.bookingDate),
        register_date: formatDateForBackend(formData.registerDate),
        control_no: formData.controlNo,
        register_no: formData.registerNo,
        claim_no: formData.claimNo,
      };

      console.log("📤 Final update payload for returns table:", updateData);

      // Step 1: Update returns table
      const updateRes = await updateBox(updateData);

      if (updateRes?.data?.success) {
        console.log("✅ Returns table updated successfully");
        
        // Step 2: Insert credit data if credit fields are filled
        const hasCreditData = creditInputs.mraNo || creditInputs.creditNo || creditInputs.mraDate || creditInputs.creditDate;
        let creditInserted = false;
        
        if (hasCreditData) {
          const newCredit = await handleCreditInsert(item.return_id);
          if (newCredit) {
            // Update UI with new credit
            setExistingCredits((prev) => [...prev, newCredit]);
            
            // Clear credit inputs
            setCreditInputs({
              mraNo: "",
              creditNo: "",
              mraDate: "",
              creditDate: "",
            });
            creditInserted = true;
          }
        }

        await Swal.fire({
          title: "Updated!",
          text: hasCreditData 
            ? "Box details and credit data have been successfully updated." 
            : "Box details have been successfully updated.",
          icon: "success",
          confirmButtonColor: "#2563eb",
          timer: 2000,
          timerProgressBar: true,
        });

        onClose(true); // Refresh parent data after update
        
        
       
      } else {
        await Swal.fire({
          title: "Failed",
          text: updateRes?.data?.message || "Update failed. Try again.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (error) {
      console.error("❌ Error updating box:", error);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to clear only credit inputs
  const clearCreditInputs = () => {
    setCreditInputs({
      mraNo: "",
      creditNo: "",
      mraDate: "",
      creditDate: "",
    });
  };

  // Handle closing modal
  const handleClose = () => {
    onClose(false); // Don't refresh when manually closing
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-400">
            UPDATE DETAILS - {item?.box_no || item?.boxNo || "N/A"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              type="button"
              className={`px-40 py-3 font-bold text-sm border-b-2 transition-colors duration-200 ${
                activeTab === "boxDetails"
                  ? "border-rose-500 text-rose-600 bg-rose-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("boxDetails")}
              disabled={loading}
            >
              BOX UPDATE
            </button>
            <button
              type="button"
              className={`px-42 py-3 font-bold text-sm border-b-2 transition-colors duration-200 ${
                activeTab === "creditDetails"
                  ? "border-rose-500 text-rose-600 bg-rose-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("creditDetails")}
              disabled={loading}
            >
              CREDIT UPDATE 
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* ===== TAB 1: BOX DETAILS ===== */}
            {activeTab === "boxDetails" && (
              <div className="space-y-6">
                {/* Box Details Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-center">
                    <thead className="text-gray-500">
                      <tr>
                        <th className="border p-2 font-semibold">BOX NO</th>
                        <th className="border p-2 font-semibold">COURIER NO</th>
                        <th className="border p-2 font-semibold">NO OF BOXES</th>
                      </tr>
                    </thead>
                    <tbody className="text-black font-bold bg-gray-200">
                      <tr>
                        <td className="border p-3">{item?.box_no || item?.boxNo || "-"}</td>
                        <td className="border p-3">{item?.courier_no || item?.courierNo || "-"}</td>
                        <td className="border p-3">{item?.no_of_boxes || item?.noOfBoxes || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Box Status Section */}
                <div className="flex gap-6 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      BOX STATUS
                    </label>
                    <select
                      name="boxStatus"
                      value={formData.boxStatus}
                      onChange={handleChange}
                      className="w-full border border-gray-400 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6a1a13] focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">-- Select Status --</option>
                      <option value="CHEKED">Checked</option>
                      <option value="NOT_CHEKED">Not Checked</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      CHECKED AND VERIFIED
                    </label>
                    <input
                      type="text"
                      name="checkedVerified"
                      value={formData.checkedVerified}
                      onChange={handleChange}
                      placeholder="Enter remark or initials"
                      className="w-full focus:outline-none bg-white border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#6a1a13] focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Date + Text Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "CLAIM DATE", name: "claimDate", type: "date" },
                    { label: "BOOKING DATE", name: "bookingDate", type: "date" },
                    { label: "CLAIM NO", name: "claimNo", type: "text" },
                    { label: "REGISTER NO", name: "registerNo", type: "text" },
                    { label: "CONTROL NO", name: "controlNo", type: "text" },
                    { label: "REGISTER DATE", name: "registerDate", type: "date" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={
                          field.type === "text"
                            ? formData[field.name]
                            : formatDateForInput(formData[field.name])
                        }
                        onChange={handleChange}
                        className="w-full border border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#6a1a13] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== TAB 2: CREDIT DETAILS ===== */}
            {activeTab === "creditDetails" && (
              <div className="space-y-6">
                {/* New Credit Entry Form */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-500 mb-4">UPDATE CREDIT</h3>
                  
                  {/* Credit Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Ebs credit no
                      </label>
                      <input
                        type="text"
                        name="mraNo"
                        value={creditInputs.mraNo}
                        onChange={handleChange}
                        className="w-full border focus:outline-none border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#6a1a13] focus:border-transparent"
                        disabled={loading}
                        placeholder="Enter EBS number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Ebs credit date
                      </label>
                      <input
                        type="date"
                        name="mraDate"
                        value={creditInputs.mraDate}
                        onChange={handleChange}
                        className="w-full border focus:outline-none border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#6a1a13] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Credit Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Salable credit no
                      </label>
                      <input
                        type="text"
                        name="creditNo"
                        value={creditInputs.creditNo}
                        onChange={handleChange}
                        className="w-full border focus:outline-none border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#6a1a13] focus:border-transparent"
                        disabled={loading}
                        placeholder="Enter Salable number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Salable credit Date
                      </label>
                      <input
                        type="date"
                        name="creditDate"
                        value={creditInputs.creditDate}
                        onChange={handleChange}
                        className="w-full border focus:outline-none border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#6a1a13] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Clear Button for Credit Inputs */}
                  {(creditInputs.mraNo || creditInputs.creditNo || creditInputs.mraDate || creditInputs.creditDate) && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={clearCreditInputs}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        disabled={loading}
                      >
                        Clear Fields
                      </button>
                    </div>
                  )}
                </div>

                {/* Display existing credit entries */}
                {existingCredits.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b">
                      <h3 className="font-semibold text-gray-700">
                        CREDIT DETAILS
                      </h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border p-3 text-left font-semibold">Ebs credit no</th>
                          <th className="border p-3 text-left font-semibold">Ebs credit date</th>
                          <th className="border p-3 text-left font-semibold">Salable credit no</th>
                          <th className="border p-3 text-left font-semibold">Salable credit Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {existingCredits.map((credit, index) => (
                          <tr key={credit.credit_id || index}>
                            <td className="border p-3">{credit.mra_no || "-"}</td>
                            <td className="border p-3">
                              {credit.mra_date ? formatDateForInput(credit.mra_date) : "-"}
                            </td>
                            <td className="border p-3">{credit.credit_no || "-"}</td>
                            <td className="border p-3">
                              {credit.credit_date ? formatDateForInput(credit.credit_date) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {existingCredits.length === 0 && (
                  <div className="text-center p-4 text-gray-500 border rounded-lg">
                    No credit details available
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border bg-gray-200 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#6a1a13] text-white rounded-lg hover:bg-[#865556] transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActionBoxUpdate;