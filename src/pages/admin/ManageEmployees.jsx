import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, statusEmployee, shipmentStatuss } from '../../service/admin/manageEmployee';
import { Pencil, Trash2, Search, X } from "lucide-react";
import Swal from "sweetalert2";
import EmployeeModal from '../../models/admin/manageEmployee/EmployeeModal';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    employee_name: '',
    employee_id: '',
    employee_password: ''
  });
  const [editingEmployee, setEditingEmployee] = useState({
    employee_name: '',
    employee_id: '',
    employee_password: '',
    no_of_data: ''
  });

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees using useMemo for better performance
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    
    if (!searchTerm.trim()) {
      return employees;
    }

    const lowercasedSearch = searchTerm.toLowerCase().trim();
    
    return employees.filter(employee => {
      // Search in multiple fields
      return (
        (employee.employee_name && employee.employee_name.toLowerCase().includes(lowercasedSearch)) ||
        (employee.employee_id && employee.employee_id.toLowerCase().includes(lowercasedSearch)) ||
        (employee.employee_password && employee.employee_password.toLowerCase().includes(lowercasedSearch)) ||
        (employee.no_of_data && employee.no_of_data.toString().includes(lowercasedSearch))
      );
    });
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getEmployees();
      
      console.log('API Response Employee:', response);
      
      let employeesData = [];
      
      if (response.data && Array.isArray(response.data.employees)) {
        employeesData = response.data.employees;
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else {
        console.warn('Unexpected API response structure');
        setError('Unexpected data format received from server');
        setEmployees([]);
        return;
      }
      
      // Convert string status to numbers and ensure shipment_status exists
      const employeesWithCorrectStatus = employeesData.map(emp => ({
        ...emp,
        employee_status: Number(emp.employee_status) || 0,
        shipment_status: emp.shipment_status !== undefined ? Number(emp.shipment_status) : 1
      }));
      
      console.log('Processed employees:', employeesWithCorrectStatus);
      setEmployees(employeesWithCorrectStatus);
      
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees. Please try again.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleStatus = async (employee) => {
    try {
      const newStatus = employee.employee_status === 1 ? 0 : 1;
      
      console.log('Toggling status for employee:', {
        no_of_data: employee.no_of_data,
        employee_id: employee.employee_id,
        currentStatus: employee.employee_status,
        newStatus: newStatus
      });
      
      // Call status API with required fields
      const response = await statusEmployee({
        employee_status: newStatus,
        no_of_data: employee.no_of_data,
        employee_id: employee.employee_id
      });
      
      // Update local state
      const updatedEmployees = employees.map(e => {
        if (e.no_of_data === employee.no_of_data && e.employee_id === employee.employee_id) {
          return {
            ...e,
            employee_status: newStatus
          };
        }
        return e;
      });
      
      setEmployees(updatedEmployees);
      
      Swal.fire({
        icon: "success",
        title: "Status Updated!",
        text: `Employee status has been ${newStatus === 1 ? 'activated' : 'deactivated'}.`,
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

  const handleShipmentStatus = async (employee) => {
    try {
      const newShipmentStatus = employee.shipment_status === 1 ? 0 : 1;
      
      console.log('Toggling shipment status for employee:', {
        no_of_data: employee.no_of_data,
        employee_id: employee.employee_id,
        currentShipmentStatus: employee.shipment_status,
        newShipmentStatus: newShipmentStatus
      });
      
      // Call shipment status API with required fields
      const response = await shipmentStatuss({
        shipment_status: newShipmentStatus,
        no_of_data: employee.no_of_data,
        employee_id: employee.employee_id
      });
      
      // Update local state
      const updatedEmployees = employees.map(e => {
        if (e.no_of_data === employee.no_of_data && e.employee_id === employee.employee_id) {
          return {
            ...e,
            shipment_status: newShipmentStatus
          };
        }
        return e;
      });
      
      setEmployees(updatedEmployees);
      
      Swal.fire({
        icon: "success",
        title: "Shipment Status Updated!",
        text: `Employee shipment status has been ${newShipmentStatus === 1 ? 'activated' : 'deactivated'}.`,
        showConfirmButton: true,
        confirmButtonColor: "#2563eb"
      });
      
    } catch (error) {
      console.error('Error updating shipment status:', error);
      Swal.fire({
        icon: "error",
        title: "Failed to Update Shipment Status!",
        text: error.response?.data?.message || "Please try again.",
        showConfirmButton: true,
        confirmButtonColor: "#dc2626"
      });
    }
  };

  const handleEdit = (employee) => {
    console.log('Edit employee:', employee);
    setEditingEmployee({
      employee_name: employee.employee_name || '',
      employee_id: employee.employee_id || '',
      employee_password: employee.employee_password || '',
      no_of_data: employee.no_of_data || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (employee) => {
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
          await deleteEmployee(employee.no_of_data, employee.employee_id);
          
          Swal.fire('Deleted!', 'Employee has been deleted.', 'success');
          fetchEmployees(); // reload list after delete
          
        } catch (error) {
          console.error('Error deleting employee:', error);
          Swal.fire('Failed!', 'Error while deleting employee', 'error');
        }
      }
    });
  };

  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewEmployee({
      employee_name: '',
      employee_id: '',
      employee_password: ''
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingEmployee({
      employee_name: '',
      employee_id: '',
      employee_password: '',
      no_of_data: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    
    try {
      const response = await addEmployee({
        employee_id: newEmployee.employee_id,
        employee_password: newEmployee.employee_password,
        employee_name: newEmployee.employee_name
      });
      
      Swal.fire({
        icon: "success",
        title: "Employee Added Successfully!",
        text: `${newEmployee.employee_name} has been added.`,
        showConfirmButton: true,
        confirmButtonColor: "#2563eb"
      });

      fetchEmployees();
      handleCloseAddModal();
      
    } catch (error) {
      console.error('Error adding employee:', error);
      Swal.fire({
        icon: "error",
        title: "Failed to Add Employee!",
        text: error.response?.data?.message || "Please try again.",
        showConfirmButton: true,
        confirmButtonColor: "#dc2626"
      });
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    
    try {
      // Call update API with required fields
      const response = await updateEmployee({
        employee_name: editingEmployee.employee_name,
        employee_password: editingEmployee.employee_password,
        employee_id: editingEmployee.employee_id,
        no_of_data: editingEmployee.no_of_data
      });
      
      Swal.fire({
        icon: "success",
        title: "Employee Updated Successfully!",
        text: `${editingEmployee.employee_name} has been updated.`,
        showConfirmButton: true,
        confirmButtonColor: "#2563eb"
      });

      fetchEmployees();
      handleCloseEditModal();
      
    } catch (error) {
      console.error('Error updating employee:', error);
      Swal.fire({
        icon: "error",
        title: "Failed to Update Employee!",
        text: error.response?.data?.message || "Please try again.",
        showConfirmButton: true,
        confirmButtonColor: "#dc2626"
      });
    }
  };

  // Safe rendering - ensure filteredEmployees is always an array
  const safeEmployees = Array.isArray(filteredEmployees) ? filteredEmployees : [];

  if (loading) {
    return (
      <div className="p-6 mt-20 flex justify-center items-center">
        <div className="text-lg">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="p-2 mt-2">
      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitEmployee}
        employeeData={newEmployee}
        onChange={handleInputChange}
        isEdit={false}
      />

      {/* Edit Employee Modal */}
      <EmployeeModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateEmployee}
        employeeData={editingEmployee}
        onChange={handleEditInputChange}
        isEdit={true}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Employees</h1>
        <button 
          className="bg-[#6a1a12] hover:bg-[#955d5d] text-white px-4 py-2 rounded-lg font-medium transition duration-200"
          onClick={handleAddEmployee}
        >
          Add New Employee
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-90 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-[#6a1a12] focus:border-[#6a1a12]"
            placeholder="Search by name, ID, ..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Search results info */}
        <div className="mt-2 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {searchTerm ? (
              <>
                Found <span className="font-semibold">{safeEmployees.length}</span> {safeEmployees.length === 1 ? 'employee' : 'employees'} 
                {searchTerm && ` matching "${searchTerm}"`}
              </>
            ) : (
              <>
                
              </>
            )}
          </p>
          {searchTerm && safeEmployees.length === 0 && (
            <button
              onClick={clearSearch}
              className="text-sm text-[#6a1a12] hover:text-[#955d5d] font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {safeEmployees.length === 0 && !searchTerm ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No employees found.</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={fetchEmployees}
          >
            Retry
          </button>
        </div>
      ) : safeEmployees.length === 0 && searchTerm ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-2">No employees match your search "{searchTerm}"</p>
          <p className="text-sm text-gray-400 mb-4">Try searching with different keywords</p>
          <button 
            className="bg-[#6a1a12] hover:bg-[#955d5d] text-white px-4 py-2 rounded"
            onClick={clearSearch}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="relative rounded-xl shadow-sm mt-4">
          <div className="overflow-x-auto overflow-y-auto max-h-[700px]  px-2">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">SNO</th>
                  <th className="p-3 text-left">EMPLOYEE NAME</th>
                  <th className="p-3 text-left">EMPLOYEE ID</th>
                  <th className="p-3 text-left">EMPLOYEE PASSWORD</th>
                  <th className="p-3 text-left">DISTRIBUTION ACCESS</th>
                  <th className="p-3 text-left">SHIPMENT ACCESS</th>
                  <th className="p-3 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeEmployees.map((employee, index) => (
                  <tr key={`${employee.no_of_data}-${employee.employee_id}`} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {employee.no_of_data || index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {employee.employee_name}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {employee.employee_id}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {employee.employee_password}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={employee.employee_status === 1}
                            onChange={() => toggleStatus(employee)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={employee.shipment_status === 1}
                            onChange={() => handleShipmentStatus(employee)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <div className="flex gap-3">
                        <Pencil 
                          className="text-blue-500 cursor-pointer hover:text-blue-700" 
                          size={16} 
                          title="Edit"
                          onClick={() => handleEdit(employee)}
                        />
                        <Trash2 
                          className="text-[#6a1a12] cursor-pointer hover:text-red-700" 
                          size={16} 
                          title="Delete"
                          onClick={() => handleDelete(employee)}
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

export default ManageEmployees;