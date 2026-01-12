import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import * as SUperAdminPages from "./index";
import SuperAdminLayout from "./superAdminLayout";

const SuperAdminRoutes = () => {
  return ( 
    <Routes>
      <Route path="/" element={<SuperAdminLayout />}>
        <Route index element={<SUperAdminPages.SuperAdminDashboard/>} />
        {/* <Route path="dashboard" element={<AdminPages.AdminDashboard />} /> */}
        {/* <Route path="inr" element={<AdminPages.InwardCover />} />
        <Route path="return" element={<AdminPages.Return />} />
        <Route path="lr-update" element={<AdminPages.LRupdate />} />
        <Route path="vehicle-movement" element={<AdminPages.VehicleMovement />} />
        <Route path="company" element={<AdminPages.Company />} />
        <Route path="customer" element={<AdminPages.Customer />} />
        <Route path="transport" element={<AdminPages.Transport />} />
        <Route path="ebs-import" element={<AdminPages.EpsImport />} />
        <Route path="manage-admin" element={<AdminPages.ManageAdmins />} /> */}
      </Route>
    </Routes>
  );
};
export default SuperAdminRoutes;