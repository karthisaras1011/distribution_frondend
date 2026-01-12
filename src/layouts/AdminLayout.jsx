import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { Header } from "../components/Header";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebarState={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header isSidebarOpen={isSidebarOpen} />
        <div className={`flex-1 overflow-y-auto p-1 transition-all scrollbar-hide duration-300 ${isSidebarOpen ? "ml-52" : "ml-16"}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
