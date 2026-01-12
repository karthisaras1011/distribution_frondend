import React, { useState, useEffect } from 'react';

const EditSalesModal = ({ customer, onClose, onUpdate }) => {
  if (!customer) return null;

  const [formData, setFormData] = useState({
    name: customer.name,
    invoiceNo: customer.invoiceNo,
    invoiceDate: customer.invoiceDate,
    invoiceValue: customer.invoiceValue,
  });

  useEffect(() => {
    setFormData({
      name: customer.name,
      invoiceNo: customer.invoiceNo,
      invoiceDate: customer.invoiceDate,
      invoiceValue: customer.invoiceValue,
    });
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...customer, ...formData });
    onClose();
  };

  return (
     <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Edit Sales Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
              <input
                type="text"
                disabled
                value={customer.company}
                className="w-full rounded-md bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Customer City</label>
            <input
              type="text"
              disabled
              value={customer.city}
              className="w-full rounded-md bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Invoice No</label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Invoice Value</label>
              <input
                type="number"
                name="invoiceValue"
                value={formData.invoiceValue}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2"
                min={0}
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#842626] text-white px-6 py-2 rounded-md"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalesModal;
