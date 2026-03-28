import React, { useState, useEffect } from "react";
import FaqModal from "../../models/admin/faq/FaqModal";
import { insertIssue, getAllIssues, deleteIssue } from "../../service/admin/faq";
import { showError, showSuccess } from "../../utils/sweetAlert";
import { Trash2,Pencil } from "lucide-react";
import API_CONFIG from "../../service/apiConfig";

const IssueTracker = () => {
  const [openModal, setOpenModal] = useState(false);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    application: "",
    module: "",
    description: "",
    screenshot: null,
    raisedBy: "",
    raisedDate: new Date().toISOString().split("T")[0],
    assignedTo: "",
    fixDate: "",
    status: "Pending"
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await getAllIssues();
      setIssues(data.issues || []);
    } catch (error) {
      showError("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILE HANDLE
  const handleChange = (e) => {
  const { name, value, files, type } = e.target;
  
  if (type === 'file') {
    const file = files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("File size should be less than 5MB");
        return;
      }
      setForm({ ...form, screenshot: file });
    } else {
      setForm({ ...form, screenshot: null });
    }
  } else {
    setForm({ ...form, [name]: value });
  }
};

  // ✅ FORM SUBMIT
  const handleSubmit = async () => {
    if (!form.application || !form.module || !form.description || !form.raisedBy) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("application", form.application);
      formData.append("module", form.module);
      formData.append("description", form.description);
      formData.append("raisedBy", form.raisedBy);
      formData.append("raisedDate", form.raisedDate);
      formData.append("assignedTo", form.assignedTo);
      formData.append("fixDate", form.fixDate);
      formData.append("status", form.status);

      if (form.screenshot) {
        formData.append("screenshot", form.screenshot);
      }

      await insertIssue(formData);

      showSuccess("Successfully Inserted");

      fetchIssues(); // refresh

      setOpenModal(false);
      resetForm();

    } catch (error) {
      showError("Insert failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      application: "",
      module: "",
      description: "",
      screenshot: null,
      raisedBy: "",
      raisedDate: new Date().toISOString().split("T")[0],
      assignedTo: "",
      fixDate: "",
      status: "Pending"
    });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      await deleteIssue(id);
      showSuccess("Deleted Successfully");
      setIssues(issues.filter(issue => issue.id !== id));
    } catch {
      showError("Delete failed");
    }
  };


  return (
    <div className="p-6">
      <button
        onClick={() => setOpenModal(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-purple-300"
      >
        Raise Issue
      </button>

      <div className="mt-6 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raised By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raised Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fix Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screenshot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>

          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="text-center hover:bg-gray-50">
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{issue.ticketId}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{issue.application}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{issue.module}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{issue.description}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{issue.raisedBy}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">
                  {new Date(issue.raisedDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{issue.assignedTo}</td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">
                  {issue.fixDate ? new Date(issue.fixDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-[16px]">{issue.status}</td>

                {/* ✅ IMAGE FIX */}
                <td className="px-4 py-2 border border-gray-200 text-[16px]">
                  {issue.screenshot && (
                    <img
                      src={`${API_CONFIG.BASE_URL}/uploads/${issue.screenshot}`}
                      alt="screenshot"
                      className="w-12 h-12 object-cover mx-auto cursor-pointer"
                      onClick={() =>
                        window.open(`${API_CONFIG.BASE_URL}/uploads/${issue.screenshot}`, "_blank")
                      }
                    />
                  )}
                </td>

                <td className="px-4 py-2 border border-gray-200 text-[16px]">
                  <div className="flex gap-2 justify-center">
                      


                  <button onClick={() => handleDelete(issue.id)}
                    className="text-[#842626] hover:text-red-700 transition-colors duration-200 p-1 rounded"
                    >
                    
                    <Trash2 size={16} />
                    
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FaqModal
        isOpen={openModal}
        onClose={handleCloseModal}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default IssueTracker;