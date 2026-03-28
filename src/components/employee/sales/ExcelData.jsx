import React, { useState } from "react";
import * as XLSX from "xlsx";
import { CompanyExcelModel } from "./companyExcelModel";
import { AddSales } from "../../../service/employee/sales";
import Swal from "sweetalert2";

function ExcelUpload({ user, onUploadComplete }) {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState({
    notInsertedData: [],
    insertedData: [],
    count: 0,
  });

  let companyName = user?.company?.name?.trim();

  const handleFileUpload = (file) => {
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setUploadResult({ notInsertedData: [], insertedData: [], count: 0 }); // Reset upload result when new file is uploaded

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target.result;
        const workbook = XLSX.read(arrayBuffer, {
          type: "array",
          cellDates: true,
        });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert Excel rows to JSON
        let rows;
        let headers;
        if (
          companyName === "Apex Labs Pvt Ltd" ||
          companyName === "Bharat Serum and Vaccines" ||
          companyName === "Gates Pharma"
        ) {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(5);
          headers = jsonData[4];
        } else if (companyName === "Pulse Pharmaceuticals Pvt Ltd") {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(2);
          headers = jsonData[1];
        } else if (companyName === "Charak Pharma Pvt ltd") {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(7);
          headers = jsonData[6];
        } else if (companyName === "Medmanor Organics Pvt Ltd") {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(3);
          headers = jsonData[2];
        } else if (companyName === "Comed Chemicals") {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(2);
          headers = jsonData[1];
        } else if (companyName === "Pulse Nutriscience Pvt Ltd") {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(2);
          headers = jsonData[1];
        } else if (companyName === "Syncom Formulations") {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(10);
          headers = jsonData[9];
        } else if (companyName === "Sri Rathna Specialities") {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(5);
          headers = jsonData[4];
        } else if (companyName === "Vedistry Pvt Ltd") {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(7);
          headers = jsonData[6];
        } else if (
          companyName === "Johnson and Johnson Pvt Ltd" ||
          companyName === "Servier India Private Limited"
        ) {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            raw: true,
          });
          rows = jsonData.slice(1);
          headers = jsonData[0];
        } else {
          rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        }

        let filteredData = rows
          .map((row) => CompanyExcelModel(companyName, row, headers))
          .filter((row) => row !== null);

        if (filteredData.length === 0) {
          let companyName = "unknown";
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          rows = jsonData.slice(1);
          headers = jsonData[0];
          filteredData = rows
            .map((row) => CompanyExcelModel(companyName, row, headers))
            .filter((row) => row !== null);
        }

        setData(filteredData);
        setShowModal(true);
      } catch (error) {
        console.error("Error processing file:", error);
        Swal.fire({
          title: "Failed!",
          text: `Format Error`,
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  console.log(uploadResult, "ioi");

  const handleConfirm = async () => {
    try {
      const countMap = data.reduce((acc, curr) => {
        const key = `${curr.invoice_no}_${curr.invoice_date}_${curr.customer_code}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const filteredData = data.filter((item) => {
        const key = `${item.invoice_no}_${item.invoice_date}_${item.customer_code}`;
        return countMap[key] === 1;
      });
      
      const response = await AddSales(filteredData, user);
      console.log("Upload Response:", response);

      // Extract data from response
      const notInsertedData = response?.data?.NotInsertedData || [];
      const insertedData = response?.data?.insertedData || [];
      const count = response?.data?.count || 0;

      // Update upload result state
      setUploadResult({
        notInsertedData,
        insertedData,
        count,
      });

      if (count > 0) {
        Swal.fire({
          title: "Success!",
          text: `Sales added successfully - ${count} records from ${fileName}`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          if (typeof onUploadComplete === "function") onUploadComplete();
          // Don't clear the input if we want to show results
        });
      } else {
        Swal.fire({
          title: "Failed!",
          text: `Sales insertion failed - ${count} records inserted from ${fileName}`,
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error uploading sales:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to upload sales data",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setData([]);
    setUploadResult({ notInsertedData: [], insertedData: [], count: 0 });
    document.getElementById("excel-file-input").value = "";
  };

  // Function to check if invoice was inserted
  const getInvoiceStatus = (invoiceNo) => {
    if (
      uploadResult.notInsertedData.length === 0 &&
      uploadResult.insertedData.length === 0
    ) {
      return "pending";
    }

    if (uploadResult.notInsertedData.includes(invoiceNo)) {
      return "failed";
    }

    if (uploadResult.insertedData.includes(invoiceNo)) {
      return "inserted";
    }

    return "unknown";
  };

  const hasUploadResults =
    uploadResult.notInsertedData.length > 0 ||
    uploadResult.insertedData.length > 0;

  return (
    <div className=" bg-gray-50 mb-4">
      <div className=" mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div
            className={`relative border-2 border-dashed rounded-lg  text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-rose-100 rounded-full">
                <svg
                  className="w-10 h-10 text-[#6a1a13]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-lg font-medium text-gray-700">
                  Drag & drop your file here
                </p>
                <p className="text-gray-500 mt-1">or</p>
                <label
                  htmlFor="excel-file-input"
                  className="mt-2 cursor-pointer"
                >
                  <span className="text-[#6a1a13] hover:text-[#865556] font-medium">
                    Browse files
                  </span>
                </label>
              </div>

              {fileName && (
                <p className="text-sm text-gray-600 mt-4">
                  Selected: <span className="font-medium">{fileName}</span>
                </p>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Processing your file...</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-600">
                {hasUploadResults ? "Upload Results" : "Preview Uploaded Data"}
              </h3>
              <p className="text-gray-500 mt-1">
                {hasUploadResults
                  ? "( Review the upload results below )"
                  : "( Please review the data before confirming )"}
              </p>
            </div>

            <div className="flex-1 overflow-auto p-2">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="text-white bg-[#6a1a13]">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      >
                        CUSTOMER CODE
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      >
                        INVOICE NO
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      >
                        INV DATE
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider"
                      >
                        INVOICE VALUE
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider"
                      >
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.map((row, i) => {
                      const status = getInvoiceStatus(row?.invoice_no);
                      return (
                        <tr
                          key={i}
                          className={
                            status === "inserted"
                              ? "bg-green-50 hover:bg-green-100"
                              : status === "failed"
                                ? "bg-red-50 hover:bg-red-100"
                                : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {row?.customer_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {row?.invoice_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {row?.invoice_date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {row?.invoice_value}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {status === "inserted" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Inserted
                              </span>
                            ) : status === "failed" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Total Records:{" "}
                  <span className="font-semibold">{data.length}</span>
                </p>
                {hasUploadResults && (
                  <div className="flex space-x-4">
                    <p className="text-sm text-green-700">
                      Successfully Inserted:{" "}
                      <span className="font-semibold">
                        {uploadResult.count}
                      </span>
                    </p>
                    <p className="text-sm text-red-700">
                      Failed:{" "}
                      <span className="font-semibold">
                        {uploadResult.notInsertedData.length}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Show failed invoice numbers */}
              {uploadResult.notInsertedData.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Failed Invoice Numbers:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {uploadResult.notInsertedData.map((invoiceNo, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded"
                      >
                        {invoiceNo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:text-white hover:bg-gray-500 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {hasUploadResults ? "Close" : "Cancel"}
              </button>
              {!hasUploadResults && (
                <button
                  onClick={handleConfirm}
                  disabled={data.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#6a1a13] hover:bg-[#865556] rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Confirm Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelUpload;
