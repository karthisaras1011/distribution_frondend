import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

const SuperAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { auth, logout, clearCompany } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebarState={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header isSidebarOpen={isSidebarOpen} />
        <div className={`flex-1 ${auth.userType === 'super_admin'?"bg-black":"bg-white"} overflow-y-auto p-4 transition-all duration-300 ${isSidebarOpen ? "ml-54" : "ml-16"}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
