import React from 'react';

const FaqModal = ({ isOpen, onClose, form, onChange, onSubmit, loading }) => {
  
  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[600px] p-6 rounded shadow max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Raise Issue</h2>

        <div className="space-y-4">
          {/* First Row - Application and Module */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Application <span className="text-red-500">*</span>
              </label>
              <input
                name="application"
                value={form.application}
                onChange={onChange}
                className="border p-2 w-full rounded"
                placeholder='Enter Application'
                required
              />
                
            
            </div>

            <div>
              <label className="block text-sm mb-1">
                Module <span className="text-red-500">*</span>
              </label>
              <input
            
                name="module"
                value={form.module}
                onChange={onChange}
                className="border p-2 w-full rounded"
                placeholder='Enter Module'
                required
             />
               
          
            </div>
          </div>

          {/* Second Row - Raised By and Raised Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Raised By <span className="text-red-500">*</span>
              </label>
              <input
                name="raisedBy"
                placeholder="Enter name"
                value={form.raisedBy}
                onChange={onChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Raised Date</label>
              <input
                type="date"
                name="raisedDate"
                value={form.raisedDate}
                disabled
                className="border p-2 w-full rounded bg-gray-50"
              />
            </div>
          </div>

          {/* Third Row - Assigned To and Target Fix Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Assigned To</label>
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={onChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select</option>
                <option value="Internal">Internal</option>
                <option value="LIBS">LIBS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Target Fix Date</label>
              <input
                type="date"
                name="fixDate"
                value={form.fixDate}
                onChange={onChange}
                min={new Date().toISOString().split('T')[0]}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          {/* Fourth Row - Priority and Screenshot */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Priority</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="border p-2 w-full rounded"
              >
                <option value="Pending">Pending</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Screenshot (max 5MB)</label>
              <input
                type="file"
                name="screenshot"
                onChange={onChange}
                accept="image/*"
                className="border p-2 w-full text-sm rounded"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              placeholder="Enter description"
              value={form.description}
              onChange={onChange}
              rows="4"
              className="border p-2 w-full rounded resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="border px-6 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:bg-purple-300"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqModal;