import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { DeleteRouteApi, getRouteApi } from "../../service/admin/routingApi";
import RoutingModel from "../../models/admin/routing/routingModel";
import RoutingTable from "../../components/admin/routingTaple/routingTable";

const Routing = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(50);
    const [showModel, setShowModel] = useState(false);
    const [props, setProps] = useState({ isEdit: false });
    const [routingData, setRoutingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isToggling, setIsToggling] = useState({});
    const [totalCount, setTotalCount] = useState(0);
    const [sortConfig, setSortConfig] = useState({ id: "route_id", desc: false });
    // Fetch routing data
    useEffect(() => {

        fetchRoutingData();
    }, [searchTerm, pageIndex, pageSize, sortConfig]);
    const fetchRoutingData = async () => {
        setLoading(true);
        try {
            // Simulate API call
            const routing_data = await getRouteApi();
            if (routing_data.data.success) {
                const filteredData = routing_data?.data?.data?.filter(route =>
                    route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    route.route_id.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setRoutingData(filteredData);
                setTotalCount(filteredData.length);
            }
        } catch (error) {
            console.error("Error fetching routing data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (route) => {
        setShowModel(true)
        setProps({
            isEdit: true,
            routing_id: route?.routing_id,
            route_name: route?.route_name,
            routing_days: JSON.parse(route?.routing_days) || []
        })
    };
    const handleDelete = async (routing_id) => {
        
        console.log(routing_id);
        
        if (window.confirm("Are you sure you want to delete this route?")) {
            try {
                // Simulate API call to delete route
                const deleteRoutes = await DeleteRouteApi(routing_id)
                if (deleteRoutes.data.success) {
                    toast.success(deleteRoutes.data.message)
                } else {
                    toast.error(deleteRoutes.data.err.message)
                }
                // Update total count
                setTotalCount(prev => prev - 1);
            } catch (error) {
                console.error("Error deleting route:", error);
            }
        }
        fetchRoutingData()
    };


    const handleAddSuccess = () => {
        setShowModel(false);
        fetchRoutingData();
    };

    const handleSortChange = (sort) => {
        setSortConfig(sort);
        setPageIndex(0); // Reset to first page when sorting
    };

    const handlePaginationChange = (newPageIndex) => {
        setPageIndex(newPageIndex);
    };

    const pageCount = Math.ceil(totalCount / pageSize);

    return (
        <div className="p-6">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="flex flex-wrap gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search routes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 w-full md:w-64 transition-all duration-200"
                    />

                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageIndex(0); // Reset to first page when changing page size
                        }}
                        className="border border-gray-300 px-3 py-2 text-sm rounded-md transition-colors duration-200"
                    >
                        {[10, 25, 50, 100].map(size => (
                            <option key={size} value={size}>{size} per page</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => setShowModel(true)}
                    className="p-2 bg-[#a76c6c] text-white px-4 py-2 text-sm rounded-md hover:bg-[#955d5d] transition-all duration-200 whitespace-nowrap"
                >
                    Create Route
                </button>

                {showModel && (
                    <RoutingModel
                        props={props}
                        onClose={() => {
                          setProps({isEdit:false})
                          setShowModel(false)}}
                        onSuccess={handleAddSuccess}
                    />
                )}
            </div>

            <RoutingTable
                data={routingData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                pageCount={pageCount}
                pageIndex={pageIndex}
                pageSize={pageSize}
                totalCount={totalCount}
                onPaginationChange={handlePaginationChange}
                onSortChange={handleSortChange}
                isToggling={isToggling}
            />
        </div>
    );
};

export default Routing;