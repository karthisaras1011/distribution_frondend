import { useFormik } from "formik";
import { toast } from "react-toastify";
import {  CreateRouteApi, UpdateRouteApi } from "../../../service/admin/routingApi";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const RoutingModel = ({ onSuccess, onClose, props }) => {
    const formik = useFormik({
        initialValues: {
            route_name: props.route_name,
            routing_days: props.routing_days||[]
        } || {
            route_name: "",
            routing_days: []
        },
        onSubmit: async (values) => {
            console.log("Form submitted:", values);
            if (props?.isEdit === true) {
                try {
                    let changedValues;

                    // Check if something changed
                    const hasChanges =
                        values.route_name !== props.route_name ||
                        JSON.stringify(values.routing_days) !== JSON.stringify(props.routing_days);

                    if (!hasChanges) {
                        toast.info("No changes detected");
                        return;
                    }
                    changedValues = { routing_id: props.routing_id };

                    if (values.route_name !== props.route_name) {
                        changedValues.route_name = values.route_name;
                    }

                    if (JSON.stringify(values.routing_days) !== JSON.stringify(props.routing_days)) {
                        changedValues.routing_days = values.routing_days;
                    }
                    console.log(changedValues);
                    
                    const updatedRoutes = await UpdateRouteApi(changedValues)
                    if (updatedRoutes.data.success) {
                        toast.success(updatedRoutes.data.message)
                    } else {
                        toast.error(updatedRoutes.data.err.message)
                    }
                } catch (error) {
                    toast.error(error.message);
                }
            } else {
                try {
                    const addRoutes = await CreateRouteApi(values)
                    if (addRoutes.data.success) {
                        toast.success(addRoutes.data.message)
                    } else {
                        toast.error(addRoutes.data.err.message)
                    }
                } catch (error) {
                    toast.error(error.message);
                }
            }
            onSuccess?.(values);
        }
    });

    const handleDayToggle = (day) => {
        const currentDays = [...formik.values.routing_days];
        const dayIndex = currentDays.indexOf(day);

        if (dayIndex > -1) {
            // Remove day if already selected
            currentDays.splice(dayIndex, 1);
        } else {
            // Add day if not selected
            currentDays.push(day);
        }

        formik.setFieldValue("routing_days", currentDays);
    };

    const handleSelectAll = () => {
        formik.setFieldValue("routing_days", [...days]);
    };

    const handleClearAll = () => {
        formik.setFieldValue("routing_days", []);
    };

    const isDaySelected = (day) => {
        return formik.values.routing_days?.includes(day);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Create Routing
                </h2>

                <form onSubmit={formik.handleSubmit}>
                    {/* Route Name Field */}
                    <div className="mb-6">
                        <label htmlFor="route_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Route Name *
                        </label>
                        <input
                            type="text"
                            id="route_name"
                            name="route_name"
                            value={formik.values.route_name}
                            onChange={formik.handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter route name"
                            required
                        />
                    </div>

                    {/* Days Selection */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Select Days *
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {days.map((day) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayToggle(day)}
                                    className={`p-2 rounded-md border-2 text-center transition-all duration-200 ${isDaySelected(day)
                                        ? "bg-[#a76c6c] border-[#a76c6c] text-white shadow-md"
                                        : "bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>

                        {/* Selected Days Summary */}
                        {formik.values.routing_days?.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Selected days:</span>{" "}
                                    {formik.values.routing_days.join(", ")}
                                </p>
                            </div>
                        )}

                        {formik.values.routing_days.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                                No days selected. Please select at least one day.
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formik.values.route_name || formik.values.routing_days.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Create Route
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoutingModel;