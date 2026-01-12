import React, { useState, useEffect } from "react";
import { Pencil, Trash2, X, Search } from "lucide-react";
import Swal from "sweetalert2";
import Pagination from "../../components/pagination/pagenation";
import {
  getDetails,
  insertDetails,
  updateDetails,
  deleteDetails,
  statusDetails,
  getDesigination,
} from "../../service/admin/employeeDetails";
import { getCompanies } from "../../service/admin/customerApi";
import { extractArray } from "../../utils/extractArray";
import { useNavigate } from "react-router-dom";

const EmployeeDetails = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: [],
    employeeName: "",
    designation: "",
    city: "",
    mobileNo: "",
    alternateNo: "",
    licenseNo: "",
    password: "",
  });
  const [companies, setCompanies] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const navigate = useNavigate();
  const recordsPerPage = 50;

  // Fetch designations from API
  const fetchDesignations = async () => {
    try {
      const response = await getDesigination();
      console.log("desigination", response);

      const designationsData = extractArray(response);
      setDesignations(designationsData);
    } catch (err) {
      console.error("Error fetching designations:", err);
      Swal.fire("Error!", "Failed to load designations", "error");
      setDesignations([
        "Add New Warehouse Person",
        "Add New Driver",
        "Add New Delivery Person",
        "Add New Collection Agent",
        "Add New Manager",
        "Add New Operator",
      ]);
    }
  };

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      const formattedData = extractArray(response);
      setCompanies(formattedData);
    } catch (err) {
      console.error("Error fetching companies:", err);
      Swal.fire("Error!", "Failed to load companies", "error");
      setCompanies([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: recordsPerPage,
        search: searchTerm || undefined,
      };
      const response = await getDetails(params);

      if (response.data?.employees) {
        setEmployees(response.data.employees);
      } else {
        setEmployees(response.data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchCompanies();
    fetchDesignations();
  }, [currentPage, searchTerm]);

  // Status toggle
  const handleStatusToggle = async (employee) => {
    try {
      setUpdatingStatus(employee.id);
      const newStatus = employee.status === 1 ? 0 : 1;

      await statusDetails({ id: employee.id, status: newStatus });

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id ? { ...emp, status: newStatus } : emp
        )
      );

      Swal.fire(
        "Success!",
        `Status updated to ${newStatus === 1 ? "Active" : "Inactive"}`,
        "success"
      );
    } catch (err) {
      Swal.fire("Error!", "Failed to update status", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Modal handlers
  const handleAddNewRecord = () => {
    setShowModal(true);
    setSelectedDesignation("");
    resetFormData();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowEditModal(false);
    setSelectedDesignation("");
    setEditingEmployee(null);
    setShowCompanyDropdown(false);
    resetFormData();
  };

  const resetFormData = () => {
    setFormData({
      companyName: [],
      employeeName: "",
      designation: "",
      city: "",
      mobileNo: "",
      alternateNo: "",
      licenseNo: "",
      password: "",
    });
    setCompanySearch("");
  };

  // Edit employee
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);

    // Find matching designation from API data
    const apiDesignation = designations.find(
      (designation) =>
        designation.designation_name === employee.designation ||
        designation === employee.designation
    );

    if (apiDesignation) {
      const designationName = apiDesignation.designation_name || apiDesignation;
      setSelectedDesignation(`Add New ${designationName}`);
    } else {
      setSelectedDesignation(`Add New ${employee.designation}`);
    }

    let selectedCompanies = [];
    if (employee.company_id) {
      try {
        if (
          typeof employee.company_id === "string" &&
          employee.company_id.startsWith("[")
        ) {
          selectedCompanies = JSON.parse(employee.company_id);
        } else if (Array.isArray(employee.company_id)) {
          selectedCompanies = employee.company_id;
        } else {
          selectedCompanies = [employee.company_id.toString()];
        }
      } catch (error) {
        selectedCompanies = [];
      }
    }

    setFormData({
      companyName: selectedCompanies,
      employeeName: employee.employee_name || "",
      designation: employee.designation || "",
      city: employee.city || "",
      mobileNo: employee.mobile_no || "",
      alternateNo: employee.alternate_no || "",
      licenseNo: employee.licence_no || "",
      password: employee.password || "",
    });
  };

  // Designation selection
  const handleDesignationSelect = (designation) => {
    setSelectedDesignation(designation);
    const actualDesignation = designation.replace("Add New ", "");
    setFormData((prev) => ({ ...prev, designation: actualDesignation }));
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const apiData = {
        employee_name: formData.employeeName,
        designation: formData.designation,
        city: formData.city,
        mobile_no: formData.mobileNo,
        alternate_no: formData.alternateNo || "",
        licence_no: formData.licenseNo || "",
        password: formData.password || "",
        status: isEdit ? editingEmployee.status : 1,
        tracking_status: isEdit ? editingEmployee.tracking_status || "" : "",
        ...(formData.companyName.length > 0 && {
          company_id: JSON.stringify(formData.companyName),
        }),
      };

      if (isEdit) apiData.id = editingEmployee.id;

      const response = isEdit
        ? await updateDetails(apiData)
        : await insertDetails(apiData);

      if (response.data?.success) {
        Swal.fire(
          "Success!",
          `Employee ${isEdit ? "updated" : "created"} successfully!`,
          "success"
        );
        handleCloseModal();
        fetchEmployees();
      } else {
        throw new Error(
          response.data?.message ||
            `Failed to ${isEdit ? "update" : "create"} employee`
        );
      }
    } catch (err) {
      Swal.fire(
        "Error!",
        err.response?.data?.message || err.message || "Operation failed",
        "error"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Delete employee
  const handleDeleteClick = async (employee) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${employee.employee_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });

    if (result.isConfirmed) {
      try {
        setDeletingEmployee(employee.id);
        await deleteDetails(employee.id);
        await fetchEmployees();
        Swal.fire("Deleted!", "Employee deleted successfully.", "success");
      } catch (err) {
        Swal.fire("Error!", "Failed to delete employee", "error");
      } finally {
        setDeletingEmployee(null);
      }
    }
  };

  // Navigate to designation page
  const handleAddDesig = () => {
    navigate("/admin/desig");
  };

  // Company selection handlers
  const handleCompanySelect = (companyId) => {
    setFormData((prev) => ({
      ...prev,
      companyName: prev.companyName.includes(companyId)
        ? prev.companyName.filter((id) => id !== companyId)
        : [...prev.companyName, companyId],
    }));
  };

  const handleRemoveCompany = (companyIdToRemove) => {
    setFormData((prev) => ({
      ...prev,
      companyName: prev.companyName.filter((id) => id !== companyIdToRemove),
    }));
  };

  const clearAllCompanies = () => {
    setFormData((prev) => ({ ...prev, companyName: [] }));
  };

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) =>
    company.company_name?.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Filter employees for table
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.employee_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalRecords = filteredEmployees.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page) => setCurrentPage(page);

  // Searchable Company Dropdown Component
  const CompanyDropdown = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">COMPANY NAME</h3>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search companies..."
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          onFocus={() => setShowCompanyDropdown(true)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Company List */}
      {showCompanyDropdown && (
        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <div
                key={company.company_id}
                className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  formData.companyName.includes(company.company_id)
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
                onClick={() => handleCompanySelect(company.company_id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.companyName.includes(company.company_id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700">
                    {company.company_name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 text-center">
              No companies found
            </div>
          )}
        </div>
      )}

      {/* Selected Companies */}
      {formData.companyName.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-800">
              Selected Companies ({formData.companyName.length})
            </span>
            <button
              type="button"
              onClick={clearAllCompanies}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.companyName.map((companyId) => {
              const company = companies.find((c) => c.company_id === companyId);
              return company ? (
                <div
                  key={companyId}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full border border-blue-200"
                >
                  <span>{company.company_name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompany(companyId)}
                    className="ml-2 text-red-500 hover:text-red-700 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Common form fields
  const FormFields = ({ isEdit = false }) => (
    <form onSubmit={(e) => handleSubmit(e, isEdit)} className="space-y-6">
      {/* Company Dropdown for specific designations */}
      {(selectedDesignation === "Add New Warehouse Person" ||
        selectedDesignation === "Add New Manager" ||
        selectedDesignation === "Add New Operator") && <CompanyDropdown />}

      {/* Designation Dropdown */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">DESIGNATION</h3>
        <select
          value={selectedDesignation}
          onChange={(e) => handleDesignationSelect(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          <option value="">Select Designation</option>
          {designations.map((designation) => {
            const designationName =
              designation.designation_name ||
              designation.designation ||
              designation;
            const displayName = designationName.startsWith("Add New ")
              ? designationName.replace("Add New ", "")
              : designationName;
            return (
              <option
                key={designationName}
                value={`Add New ${designationName}`}
              >
                {displayName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Name and Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            {selectedDesignation.replace("Add New ", "").toUpperCase()}
          </label>
          <input
            type="text"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter name"
            required
          />
        </div>

        {(selectedDesignation === "Add New Warehouse Person" ||
          selectedDesignation === "Add New Driver" ||
          selectedDesignation === "Add New Manager" ||
          selectedDesignation === "Add New Operator") && (
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
              required={!isEdit}
            />
          </div>
        )}
      </div>

      {/* City and Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            CITY
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter city"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            MOBILE NO
          </label>
          <input
            type="tel"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter mobile number"
            required
          />
        </div>
      </div>

      {/* License No for Driver */}
      {selectedDesignation === "Add New Driver" && (
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            LICENSE NO
          </label>
          <input
            type="text"
            name="licenseNo"
            value={formData.licenseNo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter license number"
          />
        </div>
      )}

      {/* Alternate Mobile */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          ALTERNATE MOBILE NO
        </label>
        <input
          type="tel"
          name="alternateNo"
          value={formData.alternateNo}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter alternate mobile number"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={handleCloseModal}
          disabled={formLoading}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formLoading}
          className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
        >
          {formLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Update"
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Employee Details
        </h1>
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <button
            className="bg-[#6a1a12] text-white px-6 py-2 rounded-lg hover:bg-[#955d5d] font-semibold"
            onClick={handleAddNewRecord}
          >
            Add New Record
          </button>

          <button
            className="bg-[#6a1a12] text-white px-6 py-2 rounded-lg hover:bg-[#955d5d] font-semibold"
            onClick={handleAddDesig}
          >
            Add New Designation
          </button>

          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 w-80 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="relative rounded-xl shadow-sm border border-gray-200 mt-4">
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-hide">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">
                SMO
              </th>
              <th className="p-3 text-left">
                EMPLOYEE NAME
              </th>
              <th className="p-3 text-left">
                DESIGNATION
              </th>
              <th className="p-3 text-left">
                CITY
              </th>
              <th className="p-3 text-left">
                MOBILE NO
              </th>
              <th className="p-3 text-left">
                STATUS
              </th>
              <th className="p-3 text-left">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((employee, index) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-[16px]  left-0 bg-white z-10 font-medium">
                  {index + 1 + (currentPage - 1) * recordsPerPage}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{employee.employee_name}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{employee.designation}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{employee.city}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{employee.mobile_no}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">
                  <button
                    onClick={() => handleStatusToggle(employee)}
                    disabled={updatingStatus === employee.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      employee.status === 1 ? "bg-green-500" : "bg-red-500"
                    } ${
                      updatingStatus === employee.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        employee.status === 1
                          ? "translate-x-5"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-2 border border-gray-200 text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(employee)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(employee)}
                      disabled={deletingEmployee === employee.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingEmployee === employee.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {filteredEmployees.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No employees found {searchTerm && "matching your search"}.
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <div className="mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
        />
        </div>
      )}

      {/* Add New Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Employee
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <FormFields />
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Employee
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <FormFields isEdit={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
