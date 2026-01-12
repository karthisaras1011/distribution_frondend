import React, { useState } from "react";
import { Icon } from "@iconify/react";
import {
  bulkUpdateCustomers,
  bulkInsertCustomer,
} from "../../../service/admin/customerApi";
import { toast } from "react-toastify";

const BulkUpdateModal = ({
  isOpen,
  onClose,
  mode = "update",
  refreshData = () => {},
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadProgress(0);
    setValidationErrors([]);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setValidationErrors([]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file before submitting.");
      return;
    }

    setIsUpdating(true);
    setValidationErrors([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      let response;
      if (mode === "update") {
        response = await bulkUpdateCustomers(formData, (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        });
      } else {
        response = await bulkInsertCustomer(formData, (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        });
      }

      if (response.data.errors?.length) {
        const flattenedErrors = response.data.errors.flatMap((error) =>
          error.errors.map((message) => ({
            row: error.row,
            customerId: error.customerId,
            error: message,
          }))
        );
        setValidationErrors(flattenedErrors);
        toast.warning(`Processed with ${flattenedErrors.length} errors`);
      } else {
        toast.success(
          response.data.message || "Operation completed successfully"
        );
        onClose();
        refreshData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process file");
      if (error.response?.data?.errors) {
        const flattenedErrors = error.response.data.errors.flatMap((error) =>
          error.errors.map((message) => ({
            row: error.row,
            customerId: error.customerId,
            error: message,
          }))
        );
        setValidationErrors(flattenedErrors);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isUpdating}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-1">
          {mode === "update"
            ? "Bulk Update Customers"
            : "Bulk Insert Customers"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload Excel file to {mode === "update" ? "update" : "insert"}{" "}
          customer data
        </p>

        <div className="border-4 border-dashed border-gray-300 p-6 rounded-md text-center mb-4">
          <div className="text-gray-500 mb-2">
            <Icon
              icon="mdi:cloud-upload"
              width="40"
              className="mx-auto text-blue-500"
            />
            <p className="font-medium text-sm">Upload your Excel file here</p>
            <p className="text-xs">Files supported: .xls, .xlsx (Max 5MB)</p>
          </div>

          <label
            className={`cursor-pointer inline-block mt-2 px-4 py-2 rounded text-sm font-medium ${
              selectedFile
                ? "bg-gray-200 text-gray-400 pointer-events-none opacity-50"
                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
            }`}
          >
            BROWSE
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUpdating}
            />
          </label>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded text-sm mb-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Icon icon="mdi:file" width="20" />
              <span>{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({Math.round(selectedFile.size / 1024)}KB)
              </span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
              disabled={isUpdating}
            >
              Clear
            </button>
          </div>
        )}

        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mb-4 border border-red-200 rounded p-4">
            <div className="flex items-center text-red-600 mb-2">
              <Icon icon="mdi:alert-circle" className="mr-1" />
              <h4 className="font-medium">
                Validation Errors ({validationErrors.length})
              </h4>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-red-50 text-left">
                    <th className="p-2">Row</th>
                    <th className="p-2">Customer ID</th>
                    <th className="p-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {validationErrors.map((error, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-red-100 hover:bg-red-50"
                    >
                      <td className="p-2">{error.row}</td>
                      <td className="p-2">{error.customerId}</td>
                      <td className="p-2 text-red-600">{error.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isUpdating || !selectedFile}
          className={`bg-[#a76c6c] hover:bg-[#955d5d] text-white text-sm font-medium px-6 py-2 rounded-md transition-colors w-full ${
            isUpdating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isUpdating
            ? "PROCESSING..."
            : mode === "update"
            ? "UPDATE"
            : "INSERT"}
        </button>
        <div className="text-xs text-gray-500 mt-4">
          <p className="font-medium mb-1">Required Fields:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ID (Customer ID)</li>
            <li>Name (Customer Name)</li>
            <li>Email (Customer Email)</li>
            <li>Phone (Customer Mobile)</li>
            <li>Address Line1</li>
            <li>City</li> 
            <li>Pincode</li>
            <li>GST IN (15 characters)</li>
            <li>Type (PHARMA, ELECTRICAL, or ELECTRONICS)</li>
          </ul>
          <p className="mt-2">
            Note: Company and Unique ID are optional fields for company
            association.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateModal;
