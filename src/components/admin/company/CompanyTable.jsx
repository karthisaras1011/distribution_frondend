import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  deleteCompany,
  getCompanies,
  toggleCompanyStatus,
  toggleBookingStatus  // Make sure this is imported
} from "../../../service/admin/companyApi";
import StatusToggle from "../../../components/admin/company/StatusToggle";
import BookigStatus from "../../../components/admin/company/BookingStatus";
import ConfirmationModal from "../../../models/admin/ConfirmationModal";
import CompanyModal from "../../../models/admin/company/Companymodel";

export const CompanyTable = ({ searchTerm, refreshKey }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useEffect(() => {
    fetchCompanies();
  }, [refreshKey]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getCompanies();
console.log(response);

      // ✅ Sort by company name alphabetically (A → Z)
      const sorted = [...response.data.company].sort((a, b) =>
        a.company_name.localeCompare(b.company_name)
      );

      setCompanies(sorted);
      setCurrentPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch companies");
      toast.error("Failed to load companies", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const status = currentStatus ? 0 : 1;

      setCompanies((prev) =>
        prev.map((company) =>
          company.id === id
            ? { ...company, company_status: status }
            : company
        )
      );

      await toggleCompanyStatus(id, status);

      toast.success(
        `Status ${status ? "activated" : "deactivated"} successfully`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } catch (err) {
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === id
            ? { ...company, company_status: currentStatus }
            : company
        )
      );

      toast.error("Failed to update status", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleBookingStatusChange = async (company_id, currentStatus) => {
    try {
      // Assuming currentStatus is boolean (true/false) or 1/0
      const status = currentStatus ? 0 : 1;

      // Optimistic update
      setCompanies((prev) =>
        prev.map((company) =>
          company.company_id === company_id
            ? { ...company, booking_status: status }
            : company
        )
      );

      // API call
      console.log("Sending: ",company_id , status);
  
     const response = await toggleBookingStatus(company_id , status);
     console.log('status',response);
     
      

      toast.success(
        `Booking ${status ? "enabled" : "disabled"} successfully`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } catch (err) {
      // Revert on error
      setCompanies((prev) =>
        prev.map((company) =>
          company.company_id === company_id
            ? { ...company, booking_status: currentStatus }
            : company
        )
      );

      toast.error("Failed to update booking status", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    let deletedCompany;
    try {
      setIsDeleting(true);

      deletedCompany = companies.find((c) => c.id === deleteModal.id);

      setCompanies((prev) =>
        prev
          .filter((company) => company.id !== deleteModal.id)
          .sort((a, b) => a.company_name.localeCompare(b.company_name))
      );

      await deleteCompany(deleteModal.id);

      toast.success(`${deleteModal.name} deleted successfully`, {
        position: "top-right",
        autoClose: 3000,
      });

      setDeleteModal(null);
    } catch (err) {
      setCompanies((prev) =>
        [...prev, deletedCompany].sort((a, b) =>
          a.company_name.localeCompare(b.company_name)
        )
      );

      toast.error(err.response?.data?.message || "Failed to delete company", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = (message) => {
    setEditModal(null);
    fetchCompanies();
    toast.success(message || "Company updated successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.reference_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading)
    return <div className="text-center py-8 text-sm">Loading companies...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8 text-sm">{error}</div>;

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-xs">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[700px] scrollbar-hide">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3 text-left ">S.No</th>
                <th className="p-3 text-left ">Actions</th>
                <th className="p-3 text-left ">Company</th>
                <th className="p-3 text-left ">Type</th>
                <th className="p-3 text-left ">Email</th>
                <th className="p-3 text-left ">Company Acronym</th>
                <th className="p-3 text-left ">Status</th>
                <th className="p-3 text-left ">Booking Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {currentCompanies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-3 text-center text-xs">
                    No companies found
                  </td>
                </tr>
              ) : (
                currentCompanies.map((company, index) => (
                  <tr
                    key={company.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="border border-gray-200 px-4 py-3 text-[16px] bg-white z-10 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditModal(company)}
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              id: company.id,
                              name: company.company_name,
                            })
                          }
                          className="text-[#6a1a12] hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {company.company_name}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {company.product_type}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {company.company_email}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      {company.reference_id}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <StatusToggle
                        active={company.company_status === 1}
                        onChange={() =>
                          handleStatusChange(
                            company.id,
                            company.company_status
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-[16px]">
                      <BookigStatus
                        active={company.booking_status === 1}
                        onChange={() =>
                          handleBookingStatusChange(
                            company.company_id,
                            company.booking_status
                          )
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredCompanies.length)}{" "}
              of {filteredCompanies.length} entries
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1 text-xs border rounded ${
                      currentPage === pageNumber
                        ? "bg-[#884d51] text-white border-[#884d51]"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteModal && (
        <ConfirmationModal
          title="Confirm Deactivation"
          message={`Please confirm if ${deleteModal.name} should be deleted permanently?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
          isDeleting={isDeleting}
        />
      )}

      {editModal && (
        <CompanyModal
          onClose={() => setEditModal(null)}
          onSuccess={handleEditSuccess}
          editData={editModal}
        />
      )}
    </div>
  );
};