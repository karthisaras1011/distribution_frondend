import { useState } from "react";
import CompanyDetails from "../components/superAdmin/dashboard/CompanyDetails";
import CustomerDetails from "../components/superAdmin/dashboard/CustomerDetails";
import SalesDetails from "../components/superAdmin/dashboard/SalesDetails";
import WholeSalesDetails from "../components/superAdmin/dashboard/WholeSalesDetails";

// src/pages/admin/AdminDashboard.js
const SuperAdminDashboard = () => {
  
  return (
   <div className="h-[100%] overflow-y-scroll p-2 bg-black  space-y-5">
  <div className="grid grid-cols-2 h-[50%]   gap-3">
    <div className="bg-[#121212] rounded-md flex justify-center items-center">
      <CompanyDetails/>
    </div>
    {/* <div className="bg-[#121212] rounded-md">2</div>
    <div className="bg-[#121212] rounded-md">3</div> */}
    <div className="bg-[#121212] rounded-md flex justify-center items-center">
      <CustomerDetails/>
    </div>
  </div>
   <div className="grid grid-cols-1 h-[70%]  gap-3 ">
     <div className="bg-[#121212] mt-1 rounded-md">
      <SalesDetails />
     </div>
    {/* <div className="bg-[#121212] rounded-md">2</div> */}
    {/* <div className="bg-[#121212] rounded-md">3</div>
    <div className="bg-[#121212] rounded-md">4</div> */}
  </div>
  <div className="grid grid-cols-1 h-[60%]  gap-3">
    <div className="bg-[#121212] rounded-md">
      <WholeSalesDetails/>
    </div>
    {/* <div className="bg-[#121212] rounded-md">2</div>
    <div className="bg-[#121212] rounded-md">3</div>
    <div className="bg-[#121212] rounded-md">employee table</div> */}
  </div>
  {/* you can add as many rows as you want */}
</div>

  );
};

export default SuperAdminDashboard;