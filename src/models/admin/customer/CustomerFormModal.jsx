import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import {
  getNextCustomerId,
  createCustomer,
  updateCustomer,
  checkCustomerName,
  getCustomerCompanies,
  searchCompaniesByName,
  checkUniqueIdExists,
  addCustomerCompany,
  removeCustomerCompany,
  getRoutes,
} from "../../../service/admin/customerApi";

const CustomerFormModal = ({
  isOpen,
  onClose,
  initialValues,
  refreshData,
  mode = "add",
}) => {    
  const [loading, setLoading] = useState(false);
  const [nextCustomerId, setNextCustomerId] = useState("");
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [addCustomerLoading, setAddCustomerLoading] = useState(false);
  const [nameCheckLoading, setNameCheckLoading] = useState(false);
  const [nameAvailable, setNameAvailable] = useState(null);
  const [nameValue, setNameValue] = useState(
    initialValues?.customer_name || ""
  );
  const [debouncedName] = useDebounce(nameValue, 500);
  const [apiErrors, setApiErrors] = useState({});
  const [customerCompanies, setCustomerCompanies] = useState([]);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [debouncedCompanySearch] = useDebounce(companySearchTerm, 300);
  const [companySearchResults, setCompanySearchResults] = useState([]);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [uniqueIdCheckLoading, setUniqueIdCheckLoading] = useState(false);
  const [uniqueIdAvailable, setUniqueIdAvailable] = useState(null);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isRemovingCompany, setIsRemovingCompany] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);

  // Fetch next customer ID when modal opens
  useEffect(() => {
    if (isOpen && mode === "add") {
      const fetchNextCustomerId = async () => {
        try {
          const response = await getNextCustomerId();
          if (response.data.success) {
            setNextCustomerId(response.data.nextCustomerId);
          }
        } catch (error) {
          toast.error("Failed to generate customer ID");
        }
      };
      fetchNextCustomerId();
    }
  }, [isOpen, mode]);

  // Check name availability
  useEffect(() => {
    const checkNameAvailability = async () => {
      if (!debouncedName || debouncedName.length < 2) {
        setNameAvailable(null);
        return;
      }

      setNameCheckLoading(true);
      try {
        const response = await checkCustomerName(
          debouncedName,
          mode === "edit" ? initialValues.customer_id : null
        );
        setNameAvailable(!response.data.isDuplicate);
      } catch (error) {
        console.error("Error checking name:", error);
        setNameAvailable(null);
      } finally {
        setNameCheckLoading(false);
      }
    };

    checkNameAvailability();
  }, [debouncedName, mode, initialValues?.customer_id]);

  // Fetch routes when modal opens
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!isOpen) return;
      
      setRoutesLoading(true);
      try {
        console.log("Fetching routes...");
        const response = await getRoutes();
        console.log("Routes API response:", response);
        
        if (response.data.success) {
          console.log("Routes data:", response.data.routes);
          setRoutes(response.data.routes || []);
        } else {
          console.log("API returned success: false");
          toast.error("Failed to load routes");
          setRoutes([]);
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
        console.error("Error details:", error.response?.data);
        toast.error("Failed to load routes");
        setRoutes([]);
      } finally {
        setRoutesLoading(false);
      }
    };

    fetchRoutes();
  }, [isOpen]);

  // Set route value when routes are loaded and we have initialValues
  useEffect(() => {
    if (mode === "edit" && initialValues?.routing_id && routes.length > 0) {
      console.log("Setting route value for edit:", initialValues.routing_id);
      formik.setFieldValue("customer_route", initialValues.routing_id);
    }
  }, [routes, mode, initialValues?.routing_id]);

  // Fetch customer companies when in edit mode
  useEffect(() => {
    if (isOpen && mode === "edit" && initialValues?.customer_id) {
      const fetchCustomerCompanies = async () => {
        try {
          const response = await getCustomerCompanies(
            initialValues.customer_id
          );
          if (response.data.success) {
            setCustomerCompanies(response.data.companies);
          }
        } catch (error) {
          console.error("Error fetching customer companies:", error);
        }
      };
      fetchCustomerCompanies();
    }
  }, [isOpen, mode, initialValues?.customer_id]);

  // Search for companies when company search term changes
  useEffect(() => {
    if (debouncedCompanySearch && debouncedCompanySearch.length >= 2) {
      const searchCompanies = async () => {
        setCompanySearchLoading(true);
        try {
          const response = await searchCompaniesByName(debouncedCompanySearch);
          if (response.data.success) {
            setCompanySearchResults(response.data.companies);
          }
        } catch (error) {
          console.error("Error searching companies:", error);
          setCompanySearchResults([]);
          toast.error("Failed to search companies");
        } finally {
          setCompanySearchLoading(false);
        }
      };
      searchCompanies();
    } else {
      setCompanySearchResults([]);
    }
  }, [debouncedCompanySearch]);

  // Check if unique ID exists
  const checkUniqueId = async (uniqueId, company_name) => {
    if (!uniqueId || uniqueId.length < 2) {
      setUniqueIdAvailable(null);
      return;
    }

    setUniqueIdCheckLoading(true);
    try {
      console.log("Checking unique ID: ", uniqueId, company_name);
      const response = await checkUniqueIdExists(uniqueId, company_name);
      setUniqueIdAvailable(!response.data.exists);
    } catch (error) {
      console.error("Error checking unique ID:", error);
      setUniqueIdAvailable(null);
    } finally {
      setUniqueIdCheckLoading(false);
    }
  };

  // Form validation schema - UPDATED FOR LOWERCASE EMAIL
  const validationSchema = Yup.object().shape({
    customer_name: Yup.string()
      .required("Customer Name is required")
      .min(2, "Too Short!")
      .max(100, "Too Long!"),
    customer_type: Yup.string().required("Customer Type is required"),
    customer_phone: Yup.string()
      .required("Phone is required")
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
    customer_email: Yup.string()
      .matches(
        /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
        "Enter a valid email address (only lowercase letters allowed - e.g., user@example.com)"
      )
      .required("Email is required"),
    alternate_email: Yup.string()
      .matches(
        /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
        "Enter a valid email address (only lowercase letters allowed)"
      )
      .nullable(),
    password:
      mode === "add"
        ? Yup.string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters")
        : Yup.string(),
    pincode: Yup.string()
      .required("Pincode is required")
      .matches(/^[0-9]{6}$/, "Pincode must be 6 digits"),
    gstin: Yup.string()
      // .required("GSTIN is required")
      .length(15, "GSTIN must be exactly 15 characters")
      .nullable(),
     
    address_line1: Yup.string().required("Address Line 1 is required"),
    customer_city: Yup.string().required("City is required"),
  });

  const formik = useFormik({
    initialValues: {
      customer_id: mode === "edit" ? initialValues.customer_id : nextCustomerId,
      customer_name: initialValues?.customer_name || "",
      customer_type: initialValues?.purchase_product_type || "PHARMA",
      customer_phone: initialValues?.customer_mobile || "",
      customer_email: initialValues?.customer_email || "",
      password: "",
      alternate_email: initialValues?.alternate_email || "",
      pincode: initialValues?.customer_pincode || "",
      gstin: initialValues?.GSTIN || "",
      address_line1: initialValues?.address_line1 || "",
      address_line2: initialValues?.address_line2 || "",
      address_line3: initialValues?.address_line3 || "",
      customer_city: initialValues?.customer_city || "",
      company_name: initialValues?.company_name || "",
      unique_id: initialValues?.unique_id || "",
      customer_route: initialValues?.routing_id || "",
    },
    validationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnMount: mode === "edit",
    onSubmit: async (values, { setErrors }) => {
      if (!isFormValid()) {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          setErrors(errors);
          return;
        }

        if (nameAvailable === false) {
          setApiErrors({ customer_name: "Customer name already exists" });
          return;
        }
      }

      setAddCustomerLoading(true);
      setApiErrors({});

      try {
        const payload = {
          ...values,
          customer_id: values.customer_id,
          customer_mobile: values.customer_phone,
          customer_pincode: values.pincode,
          purchase_product_type: values.customer_type,
          GSTIN: values.gstin ||null,
          route_id: values.customer_route
        };

        // Remove company fields from main customer payload
        delete payload.company_name;
        delete payload.unique_id;

        if (mode === "add") {
          await createCustomer(payload);
          toast.success("Customer created successfully");
        } else {
          await updateCustomer(values.customer_id, payload);
          toast.success("Customer updated successfully");
        }

        refreshData();
        onClose();
      } catch (error) {
        if (error.response?.data?.errors) {
          const errors = {};
          error.response.data.errors.forEach((err) => {
            errors[err.field] = err.message;
          });
          setErrors(errors);
          setApiErrors(errors);
        } else {
          toast.error(error.response?.data?.message || "Operation failed");
        }
      } finally {
        setAddCustomerLoading(false);
      }
    },
  });

  useEffect(() => {
    if (mode === "add" && nextCustomerId) {
      formik.setFieldValue("customer_id", nextCustomerId);
    }
  }, [nextCustomerId, mode]);

  const isFormValid = () => {
    // Check formik errors
    const customerFields = [
      "customer_name",
      "customer_type",
      "customer_phone",
      "customer_email",
      "pincode",
   
      "address_line1",
      "customer_city",
    ];

    for (const field of customerFields) {
      if (formik.errors[field]) return false;
    }

    // Check API errors
    if (Object.keys(apiErrors).length > 0) return false;

    // Check name availability
    if (
      (formik.touched.customer_name || mode === "edit") &&
      nameAvailable === false
    ) {
      return false;
    }

    // Check required fields
    for (const field of customerFields) {
      if (!formik.values[field]?.trim()) return false;
    }

    // For add mode, check password
    if (
      mode === "add" &&
      (!formik.values.password || formik.values.password.length < 6)
    ) {
      return false;
    }

    return true;
  };

  const handleAddCompany = async () => {
    if (showCompanyFields) {
      // Validate company fields manually since they're not in the schema
      const errors = {};
      if (!formik.values.company_name?.trim()) {
        errors.company_name = "Company name is required";
      }
      if (!formik.values.unique_id?.trim()) {
        errors.unique_id = "Unique ID is required";
      }

      if (Object.keys(errors).length > 0) {
        formik.setFieldTouched("company_name", true);
        formik.setFieldTouched("unique_id", true);
        setApiErrors(errors);
        return;
      }

      if (uniqueIdAvailable === false) {
        toast.error("This unique ID already exists");
        return;
      }

      setIsAddingCompany(true);
      try {
        const response = await addCustomerCompany(formik.values.customer_id, {
          company_name: formik.values.company_name,
          unique_id: formik.values.unique_id,
        });

        if (response.data.success) {
          setCustomerCompanies((prev) => [
            ...prev,
            {
              company_name: formik.values.company_name,
              unique_id: formik.values.unique_id,
            },
          ]);
          setShowCompanyFields(false);
          setCompanySearchTerm("");
          formik.setFieldValue("company_name", "");
          formik.setFieldValue("unique_id", "");
          setApiErrors({});
          toast.success("Company added successfully");
        }
      } catch (error) {
        console.error("Error adding company:", error);
        toast.error(error.response?.data?.message || "Failed to add company");
      } finally {
        setIsAddingCompany(false);
      }
    } else {
      setShowCompanyFields(true);
    }
  };

  const handleRemoveCompany = async (uniqueId) => {
    if (!uniqueId || !formik.values.customer_id) return;

    setIsRemovingCompany(true);
    try {
      const response = await removeCustomerCompany(
        formik.values.customer_id,
        uniqueId
      );

      if (response.data.success) {
        setCustomerCompanies((prev) =>
          prev.filter((company) => company.unique_id !== uniqueId)
        );
        toast.success("Company removed successfully");
      }
    } catch (error) {
      console.error("Error removing company:", error);
      toast.error(error.response?.data?.message || "Failed to remove company");
    } finally {
      setIsRemovingCompany(false);
    }
  };

  const handleGSTINChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/\s/g, "");
    if (value.length > 15) {
      value = value.substring(0, 15);
    }
    formik.setFieldValue("gstin", value);
  };

  const handleReset = () => {
    formik.resetForm();
    setShowCompanyFields(false);
    setNameValue("");
    setNameAvailable(null);
    setApiErrors({});
    setCompanySearchTerm("");
    setCompanySearchResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {mode === "edit" ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <label className="block font-medium">
                Customer Name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="customer_name"
                  type="text"
                  placeholder="Customer Name"
                  className={`w-full p-2 border rounded ${
                    (formik.touched.customer_name &&
                      formik.errors.customer_name) ||
                    nameAvailable === false
                      ? "border-red-500"
                      : nameAvailable === true
                      ? "border-green-500"
                      : ""
                  }`}
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    formik.setFieldValue("customer_name", e.target.value);
                  }}
                  onBlur={formik.handleBlur}
                />
                {nameCheckLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#a76c6c]"></div>
                  </div>
                )}
                {nameAvailable === false && !nameCheckLoading && (
                  <div className="absolute right-3 top-3 text-red-500">
                    <Icon
                      icon="mdi:close-circle-outline"
                      width={20}
                      height={20}
                    />
                  </div>
                )}
                {nameAvailable === true && !nameCheckLoading && (
                  <div className="absolute right-3 top-3 text-green-500">
                    <Icon
                      icon="mdi:check-circle-outline"
                      width={20}
                      height={20}
                    />
                  </div>
                )}
              </div>
              {formik.touched.customer_name && formik.errors.customer_name ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.customer_name}
                </div>
              ) : nameAvailable === false ? (
                <div className="text-red-500 text-sm">
                  Customer name already exists
                </div>
              ) : null}
            </div>

            {/* Customer ID - Readonly */}
            <div className="space-y-2">
              <label className="block font-medium">Customer ID</label>
              <input
                name="customer_id"
                type="text"
                className="w-full p-2 border rounded bg-gray-100"
                value={formik.values.customer_id || "Generating..."}
                disabled
              />
            </div>

            {/* Customer Type */}
            <div className="space-y-2">
              <label className="block font-medium">
                Customer Type<span className="text-red-500">*</span>
              </label>
              <select
                name="customer_type"
                className={`w-full p-2 border rounded ${
                  formik.touched.customer_type && formik.errors.customer_type
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.customer_type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select Type</option>
                <option value="PHARMA">Pharma</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="ELECTRONICS">Electronics</option>
              </select>
              {formik.touched.customer_type && formik.errors.customer_type && (
                <div className="text-red-500 text-sm">
                  {formik.errors.customer_type}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block font-medium">
                Phone<span className="text-red-500">*</span>
              </label>
              <input
                name="customer_phone"
                type="text"
                placeholder="Phone"
                className={`w-full p-2 border rounded ${
                  formik.touched.customer_phone && formik.errors.customer_phone
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.customer_phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  formik.setFieldValue("customer_phone", value);
                }}
                onBlur={formik.handleBlur}
                maxLength={10}
              />
              {formik.touched.customer_phone &&
                formik.errors.customer_phone && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.customer_phone}
                  </div>
                )}
            </div>

            {/* Email - UPDATED FOR LOWERCASE */}
            <div className="space-y-2">
              <label className="block font-medium">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                name="customer_email"
                type="email"
                placeholder="Email (lowercase only)"
                className={`w-full p-2 border rounded ${
                  formik.touched.customer_email && formik.errors.customer_email
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.customer_email}
                onChange={(e) => {
                  // Convert to lowercase automatically
                  const value = e.target.value.toLowerCase();
                  formik.setFieldValue("customer_email", value);
                }}
                onBlur={formik.handleBlur}
              />
              {formik.touched.customer_email &&
                formik.errors.customer_email && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.customer_email}
                  </div>
                )}
            </div>

            {/* Password - Only required in add mode */}
            {mode === "add" && (
              <div className="space-y-2">
                <label className="block font-medium">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className={`w-full p-2 border rounded ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.password}
                  </div>
                )}
              </div>
            )}

            {/* Alternate Email - UPDATED FOR LOWERCASE */}
            <div className="space-y-2">
              <label className="block font-medium">Alternate Email</label>
              <input
                name="alternate_email"
                type="email"
                placeholder="Alternate Email (lowercase only)"
                className={`w-full p-2 border rounded ${
                  formik.touched.alternate_email &&
                  formik.errors.alternate_email
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.alternate_email}
                onChange={(e) => {
                  // Convert to lowercase automatically
                  const value = e.target.value.toLowerCase();
                  formik.setFieldValue("alternate_email", value);
                }}
                onBlur={formik.handleBlur}
              />
              {formik.touched.alternate_email &&
                formik.errors.alternate_email && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.alternate_email}
                  </div>
                )}
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <label className="block font-medium">
                Pincode<span className="text-red-500">*</span>
              </label>
              <input
                name="pincode"
                type="text"
                placeholder="Pincode"
                className={`w-full p-2 border rounded ${
                  formik.touched.pincode && formik.errors.pincode
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  formik.setFieldValue("pincode", value);
                }}
                onBlur={formik.handleBlur}
                maxLength={6}
              />
              {formik.touched.pincode && formik.errors.pincode && (
                <div className="text-red-500 text-sm">
                  {formik.errors.pincode}
                </div>
              )}
            </div>

            {/* GSTIN */}
            <div className="space-y-2">
              <label className="block font-medium">
                GST IN
              </label>
              <input
                name="gstin"
                type="text"
                placeholder="22AAAAA0000A1Z5"
                className={`w-full p-2 border rounded ${
                  formik.touched.gstin && formik.errors.gstin
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.gstin}
                onChange={handleGSTINChange}
                onBlur={formik.handleBlur}
                maxLength={15}
              />
              {formik.touched.gstin && formik.errors.gstin && (
                <div className="text-red-500 text-sm">
                  {formik.errors.gstin}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Format: 22AAAAA0000A1Z5 (15 characters)
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2">
              <label className="block font-medium">
                House No./Bldg./Ap<span className="text-red-500">*</span>
              </label>
              <input
                name="address_line1"
                type="text"
                placeholder="Address Line 1"
                className={`w-full p-2 border rounded ${
                  formik.touched.address_line1 && formik.errors.address_line1
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.address_line1}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.address_line1 && formik.errors.address_line1 && (
                <div className="text-red-500 text-sm">
                  {formik.errors.address_line1}
                </div>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <label className="block font-medium">Street/Road/Lane</label>
              <input
                name="address_line2"
                type="text"
                placeholder="Address Line 2"
                className="w-full p-2 border rounded"
                value={formik.values.address_line2}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            {/* Address Line 3 */}
            <div className="space-y-2">
              <label className="block font-medium">Area/Locality/Sector</label>
              <input
                name="address_line3"
                type="text"
                placeholder="Address Line 3"
                className="w-full p-2 border rounded"
                value={formik.values.address_line3}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="block font-medium">
                City<span className="text-red-500">*</span>
              </label>
              <input
                name="customer_city"
                type="text"
                placeholder="City"
                className={`w-full p-2 border rounded ${
                  formik.touched.customer_city && formik.errors.customer_city
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.customer_city}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  formik.setFieldValue("customer_city", value);
                }}
                onBlur={formik.handleBlur}
              />
              {formik.touched.customer_city && formik.errors.customer_city && (
                <div className="text-red-500 text-sm">
                  {formik.errors.customer_city}
                </div>
              )}
            </div>

            {/* Route Selection */}
            <div className="space-y-2">
              <label className="block font-medium">
                Route
              </label>
              <select
                name="customer_route"
                className={`w-full p-2 border rounded ${
                  formik.touched.customer_route && formik.errors.customer_route
                    ? "border-red-500"
                    : ""
                }`}
                value={formik.values.customer_route}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={routesLoading}
              >
                <option value="">Select Route</option>
                {routesLoading ? (
                  <option value="" disabled>Loading routes...</option>
                ) : routes.length > 0 ? (
                  routes.map((route) => (
                    <option key={route.routing_id} value={route.routing_id}>
                      {route.route_name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No routes available</option>
                )}
              </select>
              {formik.touched.customer_route &&
                formik.errors.customer_route && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.customer_route}
                  </div>
                )}
              {routesLoading && (
                <div className="text-xs text-gray-500">Loading routes...</div>
              )}
            </div>
          </div>

          {/* Company Information Section - Only show in edit mode when there are companies */}
          {mode === "edit" && customerCompanies.length > 0 && (
            <div className="col-span-2 space-y-4 border-t pt-4">
              <h3 className="font-medium">Associated Companies</h3>
              <div className="grid gap-4">
                {customerCompanies.map((company, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-md flex justify-between items-center"
                  >
                    <div className="grid md:grid-cols-2 gap-4 flex-grow">
                      <div>
                        <p className="text-sm text-gray-500">COMPANY NAME</p>
                        <p className="font-medium">{company.company_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">UNIQUE ID</p>
                        <p className="font-medium">{company.unique_id}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompany(company.unique_id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                      disabled={isRemovingCompany}
                    >
                      {isRemovingCompany ? (
                        <Icon
                          icon="eos-icons:bubble-loading"
                          width="20"
                          height="20"
                        />
                      ) : (
                        <Icon
                          icon="mdi:delete-outline"
                          width="20"
                          height="20"
                        />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Company Section */}
          {showCompanyFields && (
            <div className="col-span-2 space-y-4 border-t pt-4">
              <h3 className="font-medium">Add New Company</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-medium">
                    Company Name<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="company_name"
                      type="text"
                      placeholder="Search company..."
                      className={`w-full p-2 border rounded ${
                        apiErrors.company_name ? "border-red-500" : ""
                      }`}
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                      onBlur={() => {
                        if (companySearchResults.length === 1) {
                          formik.setFieldValue(
                            "company_name",
                            companySearchResults[0].company_name
                          );
                          setCompanySearchTerm(
                            companySearchResults[0].company_name
                          );
                          setCompanySearchResults([]);
                        }
                      }}
                    />
                    {companySearchLoading && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#a76c6c]"></div>
                      </div>
                    )}
                    {companySearchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                        {companySearchResults.map((company, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              formik.setFieldValue(
                                "company_name",
                                company.company_name
                              );
                              setCompanySearchTerm(company.company_name);
                              setCompanySearchResults([]);
                            }}
                          >
                            {company.company_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {apiErrors.company_name && (
                    <div className="text-red-500 text-sm">
                      {apiErrors.company_name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block font-medium">
                    Unique ID<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="unique_id"
                      type="text"
                      placeholder="Unique ID"
                      className={`w-full p-2 border rounded ${
                        apiErrors.unique_id
                          ? "border-red-500"
                          : uniqueIdAvailable === false
                          ? "border-red-500"
                          : uniqueIdAvailable === true
                          ? "border-green-500"
                          : ""
                      }`}
                      value={formik.values.unique_id}
                      onChange={(e) => {
                        formik.setFieldValue("unique_id", e.target.value);
                        checkUniqueId(
                          e.target.value,
                          formik.values.company_name
                        );
                      }}
                      onBlur={formik.handleBlur}
                    />
                    {uniqueIdCheckLoading && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#a76c6c]"></div>
                      </div>
                    )}
                    {uniqueIdAvailable === false && !uniqueIdCheckLoading && (
                      <div className="absolute right-3 top-3 text-red-500">
                        <Icon
                          icon="mdi:close-circle-outline"
                          width={20}
                          height={20}
                        />
                      </div>
                    )}
                    {uniqueIdAvailable === true && !uniqueIdCheckLoading && (
                      <div className="absolute right-3 top-3 text-green-500">
                        <Icon
                          icon="mdi:check-circle-outline"
                          width={20}
                          height={20}
                        />
                      </div>
                    )}
                  </div>
                  {apiErrors.unique_id ? (
                    <div className="text-red-500 text-sm">
                      {apiErrors.unique_id}
                    </div>
                  ) : uniqueIdAvailable === false ? (
                    <div className="text-red-500 text-sm">
                      Unique ID already exists
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Form actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className={`bg-[#a76c6c] text-white px-4 py-2 text-sm rounded-md hover:bg-[#955d5d] transition-all duration-200 ${
                !isFormValid() || addCustomerLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={!isFormValid() || addCustomerLoading}
              title={
                !isFormValid()
                  ? "Please fill all required fields correctly"
                  : nameAvailable === null && formik.values.customer_name
                  ? "Checking name availability..."
                  : ""
              }
            >
              {addCustomerLoading ? (
                <Icon icon="eos-icons:bubble-loading" width="24" height="24" />
              ) : mode === "edit" ? (
                "Update Customer"
              ) : (
                "Add Customer"
              )}
            </button>

            {/* Only show Add Company button in edit mode */}
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleAddCompany}
                className={`px-4 py-2 rounded-md transition-colors ${
                  showCompanyFields
                    ? "bg-[#a76c6c] text-white hover:bg-[#955d5d]"
                    : "bg-[#a76c6c] text-white hover:bg-[#955d5d]"
                }`}
                disabled={isAddingCompany}
              >
                {isAddingCompany ? (
                  <Icon
                    icon="eos-icons:bubble-loading"
                    width="20"
                    height="20"
                  />
                ) : showCompanyFields ? (
                  "ADD COMPANY"
                ) : (
                  "ADD NEW COMPANY"
                )}
              </button>
            )}

          
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;