import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  RotateCcw,
  RefreshCcw,
  Briefcase,
  Users,
  UserCheck,
} from "lucide-react";
import { getCompanies, getCustomers, getEmployee, getInwards, getLr, getReturns } from "../../service/admin/dashboard";

const AdminDashboard = () => {
  const [inwards, setInwards] = useState('');
  const [returnsCount,setReturnsCount]=useState('');
  const [lrData,setLrData]=useState('');
  const [loading, setLoading] = useState(true);
  const [Companies,setCompanies] = useState('');
  const [customers,setCustomers]= useState('');
  const [employee,setEmployee] = useState('');

  useEffect(() => {
    const fetchInwards = async () => {
      try {
        const res = await getInwards();
        console.log("📦 Inward Data:", res.data);

        // your response → total_count = 33611
        setInwards(res.data?.total_count || 0);

        const returnsRes = await getReturns();
        console.log("↩️ Returns Data:", returnsRes.data);
        setReturnsCount(returnsRes.data?.total_count || 0);

         const Lr = await getLr();
        console.log("↩️ Lr Data:", Lr.data);
        setLrData(Lr.data?.total_count || 0);

        const Companies = await getCompanies();
        console.log('getCompanies',Companies);
        setCompanies(Companies.data?.total_count || 0)
         
        const Customers =await getCustomers();
        console.log('getCustomers',Customers);
        setCustomers(Customers.data?.total_count || 0)

        const Employee = await getEmployee();
        console.log('getEmployee',Employee);
        setEmployee(Employee.data?.total_count || 0)
        
        



      } catch (err) {
        console.error("❌ Failed to load inward data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInwards();
  }, []);

  const stats = [
    { label: "Total Companies", value: loading? "…" : Companies, icon: Briefcase },
    { label: "Total Customers", value: loading?"…" : customers, icon: Users },
    { label: "Total Employees", value: loading?"…" : employee, icon: UserCheck },
    { label: "Total Inwards", value: loading ? "…" : inwards, icon: ChevronLeft },
    { label: "Total Returns", value: loading ? "…" : returnsCount, icon: RotateCcw },
    { label: "Total LR Updates", value:loading?  "…" : lrData, icon: RefreshCcw },
    
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-semibold text-gray-600 mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 
              p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <Icon className="text-rose-500" size={28} />
              </div>

              <p className="text-sm text-gray-500 mt-4">{item.label}</p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AdminDashboard;
