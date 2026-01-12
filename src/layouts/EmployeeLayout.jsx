import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import { CompanyLoginModel } from "../models/employee/CompanyLoginModel";
import { useAuth } from "../contexts/AuthContext";

const EmployeeLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const { auth,checkAuth } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    if (auth.isAuthenticated && auth.userType === 'employee' && !auth.company) {
      setShowCompanyModal(true);
    }
  }, [auth]);

  return (
    <div className="flex h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebarState={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header isSidebarOpen={isSidebarOpen} />
        <div className={`flex-1 overflow-y-auto p-1 transition-all duration-300 ${isSidebarOpen ? "ml-56" : "ml-18"}`}>
          {auth.company ? (
            <Outlet />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700">
                  Please select a company to continue
                </h3>
                <button
                  onClick={() => setShowCompanyModal(true)}
                  className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
                >
                  Select Company
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCompanyModal && (
        <CompanyLoginModel 
          isOpen={showCompanyModal} 
          onClose={() => {
            setShowCompanyModal(false);
            if (!auth.company) {
              navigate('/');
            }
          }}
        />
      )}
    </div>
  );
};

export default EmployeeLayout;