import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import * as AdminPages from "../pages/admin";

const AdminRoutes = () => {
  return ( 
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminPages.AdminDashboard />} />
        <Route path ="dashboard" element={<AdminPages.AdminDashboard />} />
        <Route path="inr" element={<AdminPages.InwardCover />} />
        <Route path="return" element={<AdminPages.Return />} />
        <Route path="lr-update" element={<AdminPages.LRupdate />} />
        <Route path="vehicle-movement" element={<AdminPages.VehicleMovement />} />
        <Route path="materials" element={<AdminPages.Materials/>}/>
        <Route path="company" element={<AdminPages.Company />} />
        <Route path="customer" element={<AdminPages.Customer />} />
        <Route path="transport" element={<AdminPages.Transport />} />
       
        <Route path="manage-admin" element={<AdminPages.ManageAdmins />} />
        <Route path="manage-employee" element={<AdminPages.ManageEmployees />} />
        <Route path="customer-queries" element={<AdminPages.CustomerQueries />} />
        <Route path="case-update" element={<AdminPages.CaseUpdate />} />
        <Route path="assign" element={<AdminPages.Assign />} />
        <Route path="employee-details" element={<AdminPages.EmployeeDetails />} />
        <Route path="vehicle-list" element={<AdminPages.VehicleList />} />
        <Route path="routing" element={<AdminPages.Routing />} />
        <Route path="cheque-pending" element={<AdminPages.ChequePending />} />
        <Route path="desig" element={<AdminPages.Desigination />} />
        <Route path="vihcle" element={<AdminPages.movement />} />

      
      </Route>
    </Routes>
  );
};
export default AdminRoutes;