import React, { useState } from "react";

const DeliverApp = () => {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    status: "Delivered",
    recordsPerPage: "50",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="p-6 mt-10 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        DeliveryApp Report
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end"
      >
        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            START DATE
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            END DATE
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            STATUS
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="Delivered">Delivered</option>
            <option value="Collection Pending">Collection Pending</option>
          </select>
        </div>

        {/* Records per Page */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            RECORDS PER PAGE
          </label>
          <select
            name="recordsPerPage"
            value={form.recordsPerPage}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="50">50 (default)</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-rose-400 hover:bg-rose-500 text-white font-medium py-2 px-4 rounded-md"
          >
            Get Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliverApp;
