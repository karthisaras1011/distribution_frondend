import { useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import { Companysearch } from "../../components/admin/company/Companysearch";
import { CompanyTable } from "../../components/admin/company/CompanyTable";

export default function Company() {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Add this line

  const handleSearch = (term) => {   
    setSearchTerm(term);
  };

  // Add this function to trigger refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-2 py-2">
      <h1 className="text-1xl font-bold text-gray-600 mb-2">Company Management</h1>
      
      <Companysearch 
        onSearch={handleSearch}
        onRefresh={handleRefresh} // Pass the refresh function
      />
      
      <CompanyTable 
        searchTerm={searchTerm}
        refreshKey={refreshKey} // Pass the refresh key
      />
    </div>
  );
}