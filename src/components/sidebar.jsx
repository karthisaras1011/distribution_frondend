


import React from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink } from 'react-router-dom';

import "../index.css";

const Sidebar = ({ isSidebarOpen, toggleSidebarState }) => {
  const { auth } = useAuth();

  // Admin Menu Structure
  const adminMenuSections = [
    {
      items:[
         { icon: 'material-symbols:dashboard', label: 'Dashboard', path: '' },
      ]
    },
    {
      title: 'REPORTS',
      items: [
       
        { icon: 'mdi:file-document-multiple', label: 'Inward Cover', path: 'inr' },
        { icon: 'mdi:file-export', label: 'Returns', path: 'return' },
        { icon: 'mdi:update', label: 'LR Update', path: 'lr-update' },
        { icon: 'mdi:map-marker-path', label: 'Vehicle Movement', path: 'vehicle-movement' },
        { icon: 'mdi:package-variant', label: 'Materials and EBS Import', path: 'materials' },
      ]
    },
    {
      title: 'MASTER',
      items: [
        { icon: 'mdi:office-building', label: 'Company', path: 'company' },
        { icon: 'mdi:account-group', label: 'Customer', path: 'customer' },
        { icon: 'mdi:truck', label: 'Transport', path: 'transport' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { icon: 'mdi:account-cog', label: 'Manage Admins', path: 'manage-admin' },
        { icon: 'mdi:account-tie', label: 'Manage Employees', path: 'manage-employee' },
        //{ icon: 'mdi:help-circle', label: 'Customer Queries', path: 'customer-queries' },
       
      ]
    },
    {
      title: 'DELIVERY APP',
      items: [
         //{ icon: 'mdi:file-document-edit', label: 'Case Update', path: 'case-update' },
        { icon: 'mdi:card-account-details', label: 'Employee Details', path: 'employee-details' },
        { icon: 'mdi:car-multiple', label: 'Vehicle List', path: 'vehicle-list' },
      
         //{ icon: 'mdi:account-arrow-right', label: 'Assign', path: 'assign' },
        //{ icon: 'mdi:currency-usd', label: 'Cheque-Pending', path: 'cheque-pending' }
      ]
    },
    {
      title:'DELEVERY ANALYTICS',
      items:[
       // { icon: 'mdi:currency-usd', label: 'Cheque-Pending', path: 'cheque-pending' },
          { icon: 'mdi:map-marker-path', label: 'Routing', path: 'routing' },
          { icon: 'mdi:help-circle', label: 'FAQ', path: 'faq' }
      ]
    }
  ];

  // Super Admin Menu
  const superAdminMenuItems = [
    { icon: 'material-symbols:dashboard', label: 'Dashboard', path: '' },
  ];

  // Employee Menu Structure (Updated based on image)
  const employeeMenuSections = [
    {
      title: 'UPDATIONS', // Note: Changed from "UPIDATIONS" to "UPDATIONS" as per standard spelling
      items: [
        { icon: 'mdi:file-document-multiple', label: 'Inward Cover', path: 'inn' },
        { icon: 'mdi:file-export', label: 'Returns', path: 'return' },
        { icon: 'mdi:file-export', label: 'Returns - By APP', path: 'byapp' },
        { icon: 'mdi:database-import', label: 'Box Update', path: 'box' },
        { icon: 'mdi:currency-usd', label: 'Sales', path: 'sales' },
        //{ icon: 'mdi:bank-check', label: 'Cheque Entry', path: 'check' },
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { icon: 'mdi:package-down', label: 'Inward', path: 'ward' },
        { icon: 'mdi:package-up', label: 'Returns', path: 'rever' },
        { icon: 'mdi:truck-delivery', label: 'LR Update', path: 'lr' },
        { icon: 'mdi:database-import', label: 'Ebs', path: 'ebs' },
        { icon: 'mdi:sale', label: 'Salable', path: 'sale' },
        //{ icon: 'mdi:truck-fast', label: 'Delivery App', path: 'delever' },
        { icon: 'mdi:file-search', label: 'Missing Invoices', path: 'mising' },
      ]
    },
    // {
    //   title: 'OPTIMIZE',
    //   items: [
    //    //{ icon: 'mdi:image-remove', label: 'Delete Cheque Images', path: 'img' },
    //    // { icon: 'mdi:file-remove', label: 'Delete Invoice Images', path: 'voice' },
    //   ]
    // }
  ];

  // Determine which menu to show based on user type
  const getMenuContent = () => {
    if (auth.userType === 'super_admin') {
      return {
        type: 'flat',
        items: superAdminMenuItems,
        sections: null
      };
    }
    
    if (auth.userType === 'admin') {
      return {
        type: 'sections',
        items: null,
        sections: adminMenuSections
      };
    }
    
    // Employee
    return {
      type: 'sections',
      items: null,
      sections: employeeMenuSections
    };
  };

  const menuContent = getMenuContent();

  return (
    <aside 
      className={`
        ${isSidebarOpen ? 'w-54' : 'w-18'} 
        transition-all duration-300 
        fixed z-50 h-screen 
        ${auth.userType === 'super_admin' ? "bg-black" : "bg-white"} 
        shadow-xl flex flex-col 
        ${auth.userType === 'super_admin' ? "text-gray-100" : "text-gray-800"}
        border-r ${auth.userType === 'super_admin' ? 'border-gray-800' : 'border-gray-200'}
      `}
    >
      {/* Toggle Button (not for super_admin) */}
      {auth.userType !== 'super_admin' && (
        <div
          onClick={toggleSidebarState}
          className="absolute top-4 right-[-12px] z-50 flex items-center justify-center w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Icon 
            icon={isSidebarOpen ? "ph:caret-left" : "ph:caret-right"} 
            className="w-5 h-5 text-white" 
          />
        </div>
      )}

      {/* Header */}
      <div 
        className={`
          ${isSidebarOpen ? 'flex' : 'hidden'} 
          w-full transition-all duration-300 
          items-center justify-between px-4 h-16 
          ${auth.userType === 'super_admin' ? "bg-gray-900" : "bg-[#6a1a12]"} 
          text-white
        `}
      >
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-wide">RATHNA</span>
          <span className="text-xs opacity-80 mt-0.5">
            {auth.userType === 'admin' ? 'Admin Panel' : 
             auth.userType === 'super_admin' ? 'Super Admin' : 'Employee Portal'}
          </span>
        </div>
      </div>

      {/* Sidebar Menu Content */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {menuContent.type === 'sections' ? (
          // Render with sections (Admin & Employee)
          menuContent.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6 last:mb-2">
              {/* Section Title */}
              {isSidebarOpen && section.title && (
                <div className="px-4 py-2">
                  <div className="text-[16px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1">
                    {section.title}
                  </div>
                </div>
              )}
              
              {/* Section Items */}
              <div className="space-y-0.5 mt-1">
                {section.items.map((item, itemIndex) => (
                  <NavLink
                    key={`${sectionIndex}-${itemIndex}`}
                    to={`/${auth.userType}/${item.path}`}
                    end={item.path === ''}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-200 
                      ${isActive 
                        ? (auth.userType === 'super_admin' 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-purple-50 text-purple-700 border-l-3 border-purple-600 font-semibold') 
                        : 'hover:bg-gray-50 hover:text-purple-600'
                      } 
                      ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                      ${auth.userType === 'employee' ? 'text-sm' : ''}`
                    }
                  >
                    <Icon 
                      icon={item.icon} 
                      className={`w-5 h-5 ${auth.userType === 'employee' ? 'flex-shrink-0' : ''}`} 
                    />
                    {isSidebarOpen && (
                      <span className={`truncate ${auth.userType === 'employee' ? 'text-sm' : ''}`}>
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Render flat menu (Super Admin)
          <div className="space-y-1">
            {menuContent.items.map((item, index) => (
              <NavLink
                key={index}
                to={`/${auth.userType}/${item.path}`}
                end={item.path === ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 
                  ${isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'hover:bg-gray-800 hover:text-white'
                  } 
                  ${isSidebarOpen ? 'justify-start' : 'justify-center'}`
                }
              >
                <Icon icon={item.icon} className="w-5 h-5" />
                {isSidebarOpen && <span className="text-sm">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* User Info Footer */}
      {isSidebarOpen && auth?.user && (
        <div className={`border-t ${auth.userType === 'super_admin' ? 'border-gray-800' : 'border-gray-200'} p-3`}>
          <div className="flex items-center gap-3">
            <div className={`
              w-9 h-9 rounded-full flex items-center justify-center
              ${auth.userType === 'super_admin' 
                ? 'bg-gray-800' 
                : 'bg-purple-100'
              }
            `}>
              <Icon 
                icon={auth.userType === 'super_admin' ? "mdi:crown" : 
                      auth.userType === 'admin' ? "mdi:shield-account" : "mdi:account"} 
                className={`w-5 h-5 ${
                  auth.userType === 'super_admin' ? 'text-yellow-400' : 
                  auth.userType === 'admin' ? 'text-purple-600' : 'text-gray-600'
                }`} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {auth.user.name || auth.user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {auth.userType.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed State Indicator */}
      {!isSidebarOpen && auth?.user && (
        <div className="p-2 border-t border-gray-200">
          <div className="flex justify-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${auth.userType === 'super_admin' 
                ? 'bg-gray-800' 
                : 'bg-purple-100'
              }
            `}>
              <Icon 
                icon={auth.userType === 'super_admin' ? "mdi:crown" : 
                      auth.userType === 'admin' ? "mdi:shield" : "mdi:account"} 
                className={`w-5 h-5 ${
                  auth.userType === 'super_admin' ? 'text-yellow-400' : 
                  auth.userType === 'admin' ? 'text-purple-600' : 'text-gray-600'
                }`} 
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;