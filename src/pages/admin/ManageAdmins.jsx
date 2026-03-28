import React, { useState, useEffect } from 'react';
import { getManage, addAdmins, updateAdmins, deleteAdmins, statusAdmins } from '../../service/admin/manageAdmin';
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import AdminModal from '../../models/admin/manageAdmin/adminModal';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    admin_name: '',
    admin_id: '',
    admin_password: ''
  });
  const [editingAdmin, setEditingAdmin] = useState({
    admin_name: '',
    admin_id: '',
    admin_password: '',
    no_of_data: ''
  });

  // Fetch admins from API
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getManage();
      
      console.log('API Response:', response);
      
      let adminsData = [];
      
      if (Array.isArray(response.data)) {
        adminsData = response.data;
      } else if (response.data && Array.isArray(response.data.admins)) {
        adminsData = response.data.admins;
      } else if (response.data && Array.isArray(response.data.data)) {
        adminsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        adminsData = response.data.users;
      } else {
        console.warn('Unexpected API response structure, using mock data');
       
      }
      
      setAdmins(adminsData);
      
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Failed to fetch admins. Using demo data.');
      
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (admin) => {
    try {
      const newStatus = admin.admin_status === 1 ? 0 : 1;
      
      console.log('Toggling status for admin:', {
        no_of_data: admin.no_of_data,
        admin_id: admin.admin_id,
        currentStatus: admin.admin_status,
        newStatus: newStatus
      });
      
      // Call status API with required fields
      const response = await statusAdmins({
        admin_status: newStatus,
        no_of_data: admin.no_of_data,
        admin_id: admin.admin_id
      });
      console.log('api response',response)
      
      // Update local state
      const updatedAdmins = admins.map(a => {
        if (a.no_of_data === admin.no_of_data && a.admin_id === admin.admin_id) {
          return {
            ...a,
            admin_status: newStatus
          };
        }
        return a;
      });
      
      setAdmins(updatedAdmins);
      
      Swal.fire({
        icon: "success",
        title: "Status Updated!",
        text: `Admin status has been ${newStatus === 1 ? 'activated' : 'deactivated'}.`,
        showConfirmButton: true,
        confirmButtonColor: "#2563eb"
      });
      
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: "error",
        title: "Failed to Update Status!",
        text: error.response?.data?.message || "Please try again.",
        showConfirmButton: true,
        confirmButtonColor: "#dc2626"
      });
    }
  };

  const handleEdit = (admin) => {
    console.log('Edit admin:', admin);
    setEditingAdmin({
      admin_name: admin.admin_name || '',
      admin_id: admin.admin_id || '',
      admin_password: admin.admin_password || '',
      no_of_data: admin.no_of_data || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (admin) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAdmins(admin.no_of_data, admin.admin_id);
          
          Swal.fire('Deleted!', 'Admin has been deleted.', 'success');
          fetchAdmins(); // reload list after delete
          
        } catch (error) {
          console.error('Error deleting admin:', error);
          Swal.fire('Failed!', 'Error while deleting admin', 'error');
        }
      }
    });
  };

  const handleAddAdmin = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewAdmin({
      admin_name: '',
      admin_id: '',
      admin_password: ''
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingAdmin({
      admin_name: '',
      admin_id: '',
      admin_password: '',
      no_of_data: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await addAdmins({
        admin_id: newAdmin.admin_id,
        admin_password: newAdmin.admin_password,
        admin_name: newAdmin.admin_name
      });
    console.log('api response',response)
      
      Swal.fire({
        icon: "success",
        title: "Admin Added Successfully!",
        text: `${newAdmin.admin_name} has been added.`,
        showConfirmButton: true,
        confirmButtonColor: "#2563eb"
      });

      fetchAdmins();
      handleCloseAddModal();
      
    } catch (error) {
      console.error('Error adding admin:', error);
      Swal.fire({
        icon: "error",
        title: "Failed to Add Admin!",
        text: error.response?.data?.message || "Please try again.",
        showConfirmButton: true,
        confirmButtonColor: "#dc2626"
      });
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      // Call update API with required fields
      const response = await updateAdmins({
        admin_name: editingAdmin.admin_name,
        admin_password: editingAdmin.admin_password,
        admin_id: editingAdmin.admin_id,
        no_of_data: editingAdmin.no_of_data
      });
      console.log('api response', response);
      
      
      Swal.fire({
        icon: "success",
        title: "Admin Updated Successfully!",
        text: `${editingAdmin.admin_name} has been updated.`,
        showConfirmButton: true,
        confirmButtonColor: "#2563eb"
      });

      fetchAdmins();
      handleCloseEditModal();
      
    } catch (error) {
      console.error('Error updating admin:', error);
      Swal.fire({
        icon: "error",
        title: "Failed to Update Admin!",
        text: error.response?.data?.message || "Please try again.",
        showConfirmButton: true,
        confirmButtonColor: "#dc2626"
      });
    }
  };

  // Safe rendering - ensure admins is always an array
  const safeAdmins = Array.isArray(admins) ? admins : [];

  if (loading) {
    return (
      <div className="p-6 mt-20 flex justify-center items-center">
        <div className="text-lg">Loading admins...</div>
      </div>
    );
  }

  return (
    <div className="p-4 mt-2">
      {/* Add Admin Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitAdmin}
        adminData={newAdmin}
        onChange={handleInputChange}
        isEdit={false}
      />

      {/* Edit Admin Modal */}
      <AdminModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateAdmin}
        adminData={editingAdmin}
        onChange={handleEditInputChange}
        isEdit={true}
      />

      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Manage Admins</h1>
        <button 
          className="bg-[#6a1a12] hover:bg-[#955d5d] text-white px-4 py-2 rounded-lg font-medium transition duration-200"
          onClick={handleAddAdmin}
        >
          Add New Admin
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {safeAdmins.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No admins found.</p>
          <button 
            className="mt-4 bg-[#6a1a12] hover:bg-[#955d5d] text-white px-4 py-2 rounded"
            onClick={fetchAdmins}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="relative rounded-xl shadow-sm border border-gray-200 mt-4">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px]  ">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SNO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ADMIN NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ADMIN ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ADMIN PASSWORD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeAdmins.map((admin, index) => (
                  <tr key={`${admin.no_of_data}-${admin.admin_id}`} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {admin.no_of_data || index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {admin.admin_name}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {admin.admin_id}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {admin.admin_password}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={admin.admin_status === 1}
                            onChange={() => toggleStatus(admin)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                        <span className={`ml-2 text-sm font-medium ${admin.admin_status === 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {admin.admin_status === 1 ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <div className="flex gap-3 text-[16px]">
                        <Pencil 
                          className="text-blue-500 cursor-pointer hover:text-blue-700" 
                          size={16} 
                          title="Edit"
                          onClick={() => handleEdit(admin)}
                        />
                        <Trash2 
                          className="text-[#6a1a12] hover:text-red-700" 
                          size={16} 
                          title="Delete"
                          onClick={() => handleDelete(admin)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;