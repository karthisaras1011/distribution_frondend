// src/pages/admin/Desigination.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from "lucide-react";
import Swal from 'sweetalert2';
import { getDesigination, insertDesigination, updateDesigination, deleteDesigination } from '../../service/admin/employeeDetails';
import { extractArray } from '../../utils/extractArray';

const Desigination = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formData, setFormData] = useState({
    designation: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch designations
  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const response = await getDesigination();
      console.log('Designations API response:', response);
      
      const designationsData = extractArray(response);
      setDesignations(designationsData);
    } catch (err) {
      console.error('Error fetching designations:', err);
      Swal.fire('Error!', 'Failed to load designations', 'error');
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.designation.trim()) {
      Swal.fire('Error!', 'Please enter a designation name', 'error');
      return;
    }

    setFormLoading(true);

    try {
      if (editingDesignation) {
        // Update existing designation - send both designation and id
        const apiData = {
          designation: formData.designation.trim(),
          id: editingDesignation.id || editingDesignation
        };

        console.log('Updating designation with data:', apiData);
        await updateDesigination(apiData);
        Swal.fire('Success!', 'Designation updated successfully!', 'success');
      } else {
        // Create new designation - send only designation
        const apiData = {
          designation: formData.designation.trim()
        };

        console.log('Creating designation with data:', apiData);
        await insertDesigination(apiData);
        Swal.fire('Success!', 'Designation created successfully!', 'success');
      }
      
      handleCloseModal();
      fetchDesignations();
    } catch (err) {
      console.error('Error saving designation:', err);
      console.error('Error details:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to save designation';
      
      Swal.fire('Error!', errorMessage, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete click - UPDATED FOR URL PARAMETER
  const handleDeleteClick = async (designation) => {
    const designationName = designation.designation_name || 
                           designation.designation || 
                           designation;
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${designationName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!'
    });

    if (result.isConfirmed) {
      try {
        const designationId = designation.id || designation;
        console.log('Deleting designation with ID:', designationId);
        await deleteDesigination(designationId); // Now uses URL parameter
        Swal.fire('Deleted!', 'Designation deleted successfully.', 'success');
        fetchDesignations();
      } catch (err) {
        console.error('Error deleting designation:', err);
        console.error('Error details:', err.response?.data);
        
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            err.message || 
                            'Failed to delete designation';
        
        Swal.fire('Error!', errorMessage, 'error');
      }
    }
  };

  // Handle edit click
  const handleEditClick = (designation) => {
    setEditingDesignation(designation);
    
    const designationName = designation.designation_name || 
                           designation.designation || 
                           designation;
    
    setFormData({
      designation: designationName
    });
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDesignation(null);
    setFormData({ designation: '' });
  };

  // Handle add new button
  const handleAddNew = () => {
    setEditingDesignation(null);
    setFormData({ designation: '' });
    setShowModal(true);
  };

  // Helper function to get display name
  const getDisplayName = (designation) => {
    return designation.designation_name || 
           designation.designation || 
           designation;
  };

  // Helper function to get ID
  const getId = (designation) => {
    return designation.id || designation;
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Designation Management</h1>
        <button 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-semibold flex items-center gap-2"
          onClick={handleAddNew}
        >
          <Plus size={20} />
          Add New Designation
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading designations...</p>
        </div>
      )}

      {/* Designations List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {designations.map((designation, index) => (
                  <tr key={getId(designation)} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDisplayName(designation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getId(designation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(designation)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(designation)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {designations.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No designations found. Click "Add New Designation" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingDesignation ? 'Edit Designation' : 'Add New Designation'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation Name
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter designation name"
                    required
                    autoFocus
                  />
                </div>
                
                {editingDesignation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation ID
                    </label>
                    <input
                      type="text"
                      value={editingDesignation.id || editingDesignation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">This ID is automatically generated and cannot be changed.</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !formData.designation.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingDesignation ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingDesignation ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desigination;