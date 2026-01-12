import React, { useState } from "react";
import { Disclosure } from "@headlessui/react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { getMissingInvoices } from "../../service/employee/missing";
import { useAuth } from "../../contexts/AuthContext";

const MissingInvoices = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [seriesFound, setSeriesFound] = useState([]);
  const [seriesData, setSeriesData] = useState({});
  const [expandedSeries, setExpandedSeries] = useState(null);
  const [duplicateInvoices, setDuplicateInvoices] = useState([]);
  const [showAccordion, setShowAccordion] = useState(false);
  const [missingInvoicesData, setMissingInvoicesData] = useState(null);
  const [responseData, setResponseData] = useState(null);

  const { auth } = useAuth();
  const companyId = auth?.company?.id || "";
   
  const companyName = auth?.company?.name || "Company";

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      alert("Please select both dates");
      return;
    }

    setLoading(true);
    setShowAccordion(false);
    setExpandedSeries(null);
    setMissingInvoicesData(null);
    setSeriesFound([]);
    setSeriesData({});
    setDuplicateInvoices([]);

    try {
      const formatDateForAPI = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      const params = {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        search: searchQuery || "",
        company_id: companyId,
      };

      const response = await getMissingInvoices(params);
      console.log("Response Data:", response.data);
      
      const responseData = response.data;
      
      if (responseData?.success) {
        const query = responseData.query || {};
        const apiData = responseData.data || {};
        const summary = responseData.summary || {};
        const insights = responseData.insights || {};
        
        const series_found_from_query = query.series_found || [];
        const series_from_data = Object.keys(apiData)
          .filter(key => key.startsWith('series_'))
          .map(key => key.replace('series_', ''));
        
        const finalSeriesFound = series_found_from_query.length > 0 
          ? series_found_from_query 
          : series_from_data;
        
        const duplicate = apiData.duplicate || [];
        
        setResponseData(responseData);
        setSeriesFound(finalSeriesFound);
        setDuplicateInvoices(duplicate);
        setShowAccordion(true);

        const seriesDataObj = {};
        finalSeriesFound.forEach((series) => {
          const backendKey = `series_${series}`;
          seriesDataObj[series] = apiData[backendKey] || [];
        });

        setSeriesData(seriesDataObj);
        
        if (summary.series_with_gaps) {
          setMissingInvoicesData({
            series_with_gaps: summary.series_with_gaps,
            total_missing_invoices: summary.total_missing_invoices || 0
          });
        } else {
          setMissingInvoicesData(null);
        }

      } else {
        console.log("❌ No success flag");
        setSeriesFound([]);
        setDuplicateInvoices([]);
        setMissingInvoicesData(null);
        alert("No data found in response");
      }
    } catch (err) {
      alert(`Error fetching invoice data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesClick = (series) => {
    setExpandedSeries((prev) => (prev === series ? null : series));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full mt-4 px-6">
      {/* 🔴 CHANGED: Dynamic company name */}
      <h1 className="text-2xl font-semibold text-gray-600 mb-10">
        {companyName} - INVOICES
      </h1>

      {/* FILTER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-18">
        <div className="flex flex-col w-full lg:w-100">
          <label className="text-xs font-semibold text-gray-500 mb-1">
            START DATE
          </label>
          <input
            type="date"
            className="border px-3 py-2 rounded-md text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col w-full lg:w-100">
          <label className="text-xs font-semibold text-gray-500 mb-1">
            END DATE
          </label>
          <input
            type="date"
            className="border px-3 py-2 rounded-md text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col w-full lg:w-100">
          <label className="text-xs font-semibold text-gray-500 mb-1">
            SEARCH
          </label>
          <input
            type="text"
            placeholder="Search invoice numbers..."
            className="border px-3 py-2 rounded-md text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#842626] hover:bg-amber-650 text-white px-10 lg:px-16 py-2 rounded-md mt-2 font-semibold disabled:bg-rose-300"
        >
          {loading ? "Searching..." : "Find"}
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-10 text-center text-gray-600 text-lg">
          Loading invoice data...
        </div>
      )}

      {/* MISSING INVOICES SECTION */}
      {showAccordion && missingInvoicesData && !loading && (
        <div className="mt-10">
          <Disclosure defaultOpen>
              <div className="border-2 border-gray-100 rounded-xl overflow-hidden mb-6">
                <Disclosure.Button className="flex justify-between items-center bg-gray-50 p-4 text-block font-semibold text-lg w-full">
                  <span>Missing Invoices ({missingInvoicesData.total_missing_invoices})</span>
                </Disclosure.Button>
              </div>
          </Disclosure>
        </div>
      )}

      {/* SERIES FOUND */}
      {showAccordion && seriesFound.length > 0 && !loading && (
        <div className="mt-10">
          <Disclosure defaultOpen>
            {({ open }) => (
              <div className="border-2 border-gray-100 rounded-xl overflow-hidden mb-6">
                <Disclosure.Button className="flex justify-between items-center bg-gray-50 p-4 text-block font-semibold text-lg w-full">
                  <span>Series Found ({seriesFound.length})</span>
                  {open ? (
                    <ChevronDownIcon className="w-5 h-5" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5" />
                  )}
                </Disclosure.Button>

                <Disclosure.Panel>
                  <div className="p-4 bg-white">
                    {/* Summary */}
                    {responseData?.summary && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Summary:
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {responseData.summary.total_invoices_analyzed || 0}
                            </div>
                            <div className="text-sm text-gray-500">
                              Total Invoices
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {responseData.summary.total_series_analyzed || 0}
                            </div>
                            <div className="text-sm text-gray-500">
                              Total Series
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {responseData.summary.total_series_with_gaps || 0}
                            </div>
                            <div className="text-sm text-gray-500">
                              Series with Gaps
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {responseData.summary.total_missing_invoices || 0}
                            </div>
                            <div className="text-sm text-gray-500">
                              Missing Invoices
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* If no series expanded: show cards */}
                    {!expandedSeries && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {seriesFound.map((series, idx) => {
                          const hasMissing = missingInvoicesData?.series_with_gaps?.some(
                            s => s.series === series
                          );
                          const itemCount = seriesData[series]?.length || 0;
                          
                          return (
                            <div
                              key={idx}
                              className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                                hasMissing
                                  ? 'border-red-200 bg-red-50 hover:bg-red-100'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                              onClick={() => handleSeriesClick(series)}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-700">
                                  Series {series}
                                </h4>

                                <div className={`px-3 py-1 rounded-full font-bold ${
                                  itemCount > 0 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {itemCount}
                                </div>
                              </div>

                              <div className="flex justify-between items-center mt-2">
                                <div className="text-xs text-gray-400">
                                  Click to view {itemCount} invoices
                                </div>
                                {hasMissing && (
                                  <div className="text-xs text-red-500 font-medium">
                                    Has missing invoices
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Expanded Series Table */}
                    {expandedSeries && seriesData[expandedSeries] && (
                      <div className="mt-6 border rounded-lg overflow-hidden">
                        <div className="bg-blue-50 p-4 text-blue-700 font-semibold flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span>
                              Series {expandedSeries} - {seriesData[expandedSeries].length} invoices
                            </span>
                            {missingInvoicesData?.series_with_gaps?.some(
                              s => s.series === expandedSeries
                            ) && (
                              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                                Contains Missing Invoices
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => setExpandedSeries(null)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ChevronUpIcon className="w-5 h-5" />
                          </button>
                        </div>

                        {seriesData[expandedSeries].length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="p-3 text-sm text-left">Invoice No</th>
                                  <th className="p-3 text-sm text-left">Series</th>
                                  <th className="p-3 text-sm text-left">Missing Number</th>
                                  <th className="p-3 text-sm text-left">Company</th>
                                  <th className="p-3 text-sm text-left">Created At</th>
                                </tr>
                              </thead>

                              <tbody>
                                {seriesData[expandedSeries].map((inv, i) => (
                                  <tr
                                    key={i}
                                    className="border-b hover:bg-gray-50"
                                  >
                                    <td className="p-3 font-medium">{inv.invoice_no}</td>
                                    <td className="p-3">{inv.series}</td>
                                    <td className="p-3">
                                      {inv.missing_number}
                                    </td>
                                    <td className="p-3">{inv.company_name}</td>
                                    <td className="p-3">
                                      {formatDate(inv.created_at)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-gray-500">
                            No invoices found for this series in the selected date range.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        </div>
      )}

      {/* DUPLICATE INVOICES */}
      {showAccordion && duplicateInvoices.length > 0 && (
        <div className="mt-6">
          <Disclosure defaultOpen>
            {({ open }) => (
              <div className="border-2 border-blue-400 rounded-xl overflow-hidden">
                <Disclosure.Button className="flex justify-between items-center bg-blue-50 p-4 text-blue-700 font-semibold text-lg w-full">
                  Duplicate Invoices ({duplicateInvoices.length})
                  {open ? (
                    <ChevronDownIcon className="w-5 h-5" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5" />
                  )}
                </Disclosure.Button>

                <Disclosure.Panel>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 text-sm text-left">SHO</th>
                          <th className="p-4 text-sm text-left">Created</th>
                          <th className="p-4 text-sm text-left">Company</th>
                          <th className="p-4 text-sm text-left">Invoice No</th>
                        </tr>
                      </thead>

                      <tbody>
                        {duplicateInvoices.map((d, i) => (
                          <tr
                            key={i}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-4">{d.sho}</td>
                            <td className="p-4">
                              {formatDate(d.createdDate)}
                            </td>
                            <td className="p-4">{d.companyName}</td>
                            <td className="p-4 font-medium">{d.invoiceNo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        </div>
      )}

      {/* NO DATA */}
      {showAccordion && seriesFound.length === 0 && !loading && (
        <div className="border p-8 rounded-xl text-center text-gray-500 mt-10">
          No invoices found. Try adjusting filters.
        </div>
      )}
    </div>
  );
};

export default MissingInvoices;