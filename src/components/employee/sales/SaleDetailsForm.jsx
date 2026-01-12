import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ExcelUpload from './ExcelData';

export const SaleDetailsForm = ({onUploadComplete}) => {
  const {auth} =useAuth();
   const company = auth?.company || null;

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();
  
  };

   const handleUploadComplete = () => {
    if (typeof onUploadComplete === "function") {
    onUploadComplete();  // 🔥 Refresh sales table
  }
  };

  return (
    <div className=" bg-white rounded-xl shadow-md p-4 mb-6">
      {/* <h2 className="text-3xl font-semibold text-gray-400 ">Sale Details</h2> */}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6 flex justify-between">
          {/* Company Name */}
          <div className='w-[30%] flex flex-col justify-center '>
            <label className="block text-sm  font-semibold text-gray-400 ">
              COMPANY NAME
            </label>
            <input
              type="text"
              value={company?.name || ""}
              disabled
              className="w-full max-w-md px-4 py-3 bg-gray-200 text-gray-700 rounded-md border border-gray-300 cursor-not-allowed"
            />
          </div>

          {/* File Input & Update Button */}
          <div className='w-[50%] flex flex-col justify-center '>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              ACCEPT .XLS, .XLSX, .CSV ONLY
            </label>
            <div className="">
            <ExcelUpload user={auth} onUploadComplete={handleUploadComplete}/>
            </div>
            {file && (
              <p className="text-sm text-gray-500 mt-1">Selected File: {file.name}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
