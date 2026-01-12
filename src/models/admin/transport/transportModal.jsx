import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const TransportModal = ({ 
  isOpen, 
  onClose, 
  transportData, 
  onSave,
  isEditing = true 
}) => {
  const [formData, setFormData] = useState({
    transport_name: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form when modal opens or transportData changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && transportData) {
        setFormData({
          transport_name: transportData.transport_name ? transportData.transport_name.replace(/\r\n/g, '').trim() : ""
        });
      } else {
        setFormData({ transport_name: "" });
      }
      setError("");
    }
  }, [isOpen, transportData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.transport_name.trim()) {
      setError("Transport name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(formData);
      // The parent component will handle closing and showing success message
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save transport data");
      console.error("Error saving transport:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Update Transport" : "Add New Transport"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TRANSPORT NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="transport_name"
              value={formData.transport_name}
              onChange={handleChange}
              placeholder="Enter transport name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-400 text-white rounded-lg hover:bg-rose-500 transition-colors flex items-center gap-2 disabled:bg-rose-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update" : "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportModal;