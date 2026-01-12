import React, { useState } from 'react';
import { FaPowerOff, FaUserCircle, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({ isSidebarOpen }) => {
  const { auth, logout, clearCompany } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCompanyLogout = async () => {
    try {
      await clearCompany();
      setOpen(false);
      navigate('/employee');
    } catch (error) {
      console.error("Company logout error:", error);
    }
  };

  return (
    <div className={`${auth.userType === 'super_admin'?"bg-black":"bg-white"} shadow rounded-md px-6 py-1 flex items-center justify-between`}>
      {/* Empty div to maintain layout */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}></div>
      
      {/* User Profile */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 bg-rose-300 rounded-full flex items-center justify-center text-white hover:bg-rose-400 transition-colors"
          aria-label="User menu"
        >
          <FaUserCircle className="text-gray-600" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md z-50 divide-y divide-gray-100">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-rose-300 flex items-center justify-center text-white font-bold">
                {auth.userName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {auth.userName || 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  {auth.userType ? `${auth.userType.charAt(0).toUpperCase() + auth.userType.slice(1)}` : 'Role'}
                </div>
              </div>
            </div>

            {/* Super Admin Access Button (only for Rathna Kumar admin) */}
            {auth.userType === 'admin' && auth.userName === 'Rathna Kumar' && (
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/super_admin');
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FaBuilding className="text-gray-500" />
                Super Admin Dashboard
              </button>
            )}

            {/* Company Logout (only for employees with company selected) */}
            {auth.userType === 'employee' && auth.company && (
              <button
                onClick={handleCompanyLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FaBuilding className="text-gray-500" />
                Logout Company
              </button>
            )}

            {/* Main Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FaPowerOff className="text-gray-500" />
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};