import React, { useState, useEffect } from "react";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import {
  getTransport,
  editTransport,
  addTransport,
  deleteTransport,
} from "../../service/admin/transport";
import Pagination from "../../components/pagination/pagenation";
import TransportModal from "../../models/admin/transport/transportModal";

const Transport = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);

  const cleanTransportName = (name) =>
    name ? name.replace(/\r\n/g, "").trim() : "";

  const fetchTransportData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getTransport();
      if (response.data?.success) {
        const transports = response.data.transports || [];
        setData(transports);
        setFilteredData(transports);
        setTotalRecords(transports.length);
      } else {
        setData([]);
        setFilteredData([]);
        setTotalRecords(0);
      }
    } catch (err) {
      setError("Failed to fetch transport data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, []);

  useEffect(() => {
    const filtered = search
      ? data.filter((x) =>
          cleanTransportName(x.transport_name)
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : data;
    setFilteredData(filtered);
    setTotalRecords(filtered.length);
    setCurrentPage(1);
  }, [search, data]);

  const currentRecords = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const handleAddClick = () => {
    setEditingTransport(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (transport) => {
    setEditingTransport(transport);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveTransport = async (formData) => {
    try {
      if (isEditing) {
        const updateData = {
          no_of_data: editingTransport.no_of_data,
          transport_name: formData.transport_name,
        };
        await editTransport(updateData);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Transport updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await addTransport(formData);
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: "Transport created successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      fetchTransportData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || "Failed to save transport. Try again.",
      });
      throw err;
    }
  };

  const handleDeleteClick = async (transport) => {
    const name = cleanTransportName(transport.transport_name);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${name}" permanently?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        await deleteTransport(transport.no_of_data);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `"${name}" deleted successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
        fetchTransportData();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: err.response?.data?.message || "Failed to delete transport",
        });
      }
    }
  };

  return (
    <div className="p-2">
      <div className="bg-white p-2 mb-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Transport</h1>

          <button
            className="px-4 py-2 bg-[#6a1a12] text-white rounded shadow hover:bg-[#955d5d] flex items-center gap-1"
            onClick={handleAddClick}
          >
            <Plus size={18} /> Add new record
          </button>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="flex items-center w-1/3 border rounded px-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search transport name…"
              className="w-full p-2 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border px-4 py-2 rounded text-gray-600"
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={50}>50 (default)</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading transport data...</div>
        ) : (
          <>
            {/* table wrapper with vertical scroll only */}
            <div className="overflow-y-auto max-h-[600px] scrollbar-hide">
              {/* table-fixed so column widths are respected */}
              <table className="w-full table-fixed border-collapse ">
               

                <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-20">
                  <tr>
                    <th className="p-3 text-center ">SNO</th>
                    <th className="p-3 text-center ">TRANSPORT NAME</th>
                    <th className="p-3 text-center ">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((x, i) => (
                      <tr key={x.no_of_data} className="hover:bg-gray-50">
                        <td
                          className="border border-gray-200 px-4 py-3 text-[16px] left-0 bg-white z-10 font-medium text-center"
                          aria-label={`Row number ${(currentPage - 1) * recordsPerPage + i + 1}`}
                        >
                          {(currentPage - 1) * recordsPerPage + i + 1}
                        </td>

                        <td className="px-4 py-2 border border-gray-200 text-[16px] text-center">
                          {cleanTransportName(x.transport_name)}
                        </td>

                        <td className="px-4 py-2 border border-gray-200 text-[16px] text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEditClick(x)}
                              aria-label={`Edit ${cleanTransportName(x.transport_name)}`}
                              className="p-1"
                            >
                              <Pencil size={18} className="text-blue-500 hover:text-blue-700" />
                            </button>

                            <button
                              onClick={() => handleDeleteClick(x)}
                              aria-label={`Delete ${cleanTransportName(x.transport_name)}`}
                              className="p-1"
                            >
                              <Trash2 size={18} className="text-[#6a1a12] hover:text-red-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-gray-500">
                        {data.length === 0 ? "No transport data available" : "No matching results"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalRecords={totalRecords}
                  recordsPerPage={recordsPerPage}
                  showInfo={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      <TransportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transportData={editingTransport}
        onSave={handleSaveTransport}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Transport;
